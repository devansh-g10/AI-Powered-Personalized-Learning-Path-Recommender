import {
  generateRoadmap,
  generateRoadmapStream,
  askTopicQuestion,
  continueConversation,
  modifyRoadmap,
} from "./ai.service.js";
import {
  createConversation,
  getConversations,
  getConversationById,
  deleteConversation,
  getMessages,
  getLearningContext,
  saveLearningContext,
  getRoadmap,
  saveRoadmap,
  getTopicByTopicId,
} from "../services/conversation.service.js";
import {
  getCachedMessages,
  setCachedMessages,
  getCachedRoadmap,
  setCachedRoadmap,
  getCachedLearningContext,
  setCachedLearningContext,
  invalidateConversationCache,
} from "../services/cache.service.js";
import {
  enqueuePersistenceJob,
  createMessageIds,
} from "../services/queue.service.js";

// ─── Conversations ────────────────────────────────────────────────────────────

/**
 * POST /api/ai/conversations
 * Creates a new conversation for the authenticated user.
 */
export const createConversationHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title } = req.body;

    const conversation = await createConversation(userId, title);

    return res.status(201).json({
      message: "Conversation created",
      conversation,
    });
  } catch (err) {
    console.error("createConversation error:", err.message);
    return res.status(500).json({ message: "Failed to create conversation" });
  }
};

/**
 * GET /api/ai/conversations
 * Returns all conversations for the authenticated user.
 */
export const getConversationsHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await getConversations(userId);

    return res.status(200).json({ conversations });
  } catch (err) {
    console.error("getConversations error:", err.message);
    return res.status(500).json({ message: "Failed to fetch conversations" });
  }
};

/**
 * GET /api/ai/conversations/:conversationId
 * Returns a full conversation with messages, context, and roadmap.
 * Tries Redis first, falls back to PostgreSQL.
 */
export const getConversationHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    const conversation = await getConversationById(conversationId, userId);

    return res.status(200).json({ conversation });
  } catch (err) {
    if (err.message === "Forbidden") return res.status(403).json({ message: "Forbidden" });
    if (err.message === "Conversation not found")
      return res.status(404).json({ message: "Conversation not found" });
    console.error("getConversation error:", err.message);
    return res.status(500).json({ message: "Failed to fetch conversation" });
  }
};

/**
 * DELETE /api/ai/conversations/:conversationId
 * Deletes a conversation and all associated data (cascade).
 */
export const deleteConversationHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    await deleteConversation(conversationId, userId);
    await invalidateConversationCache(conversationId);

    return res.status(200).json({ message: "Conversation deleted" });
  } catch (err) {
    if (err.message === "Forbidden") return res.status(403).json({ message: "Forbidden" });
    if (err.message === "Conversation not found")
      return res.status(404).json({ message: "Conversation not found" });
    console.error("deleteConversation error:", err.message);
    return res.status(500).json({ message: "Failed to delete conversation" });
  }
};

// ─── Messages ─────────────────────────────────────────────────────────────────

/**
 * GET /api/ai/conversations/:conversationId/messages
 * Returns all messages — from Redis cache or PostgreSQL.
 */
export const getMessagesHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    // Try Redis first
    const cached = await getCachedMessages(conversationId);
    if (cached) {
      return res.status(200).json({ messages: cached, source: "cache" });
    }

    // Fallback to PostgreSQL
    const messages = await getMessages(conversationId, userId);

    // Populate cache for future requests
    await setCachedMessages(conversationId, messages);

    return res.status(200).json({ messages, source: "database" });
  } catch (err) {
    if (err.message === "Forbidden") return res.status(403).json({ message: "Forbidden" });
    if (err.message === "Conversation not found")
      return res.status(404).json({ message: "Conversation not found" });
    console.error("getMessages error:", err.message);
    return res.status(500).json({ message: "Failed to fetch messages" });
  }
};

/**
 * POST /api/ai/conversations/:conversationId/messages
 *
 * Main chat endpoint. Flow:
 * 1. Verify user owns conversation
 * 2. Load conversation history (Redis → DB)
 * 3. Load context + roadmap
 * 4. Call AI
 * 5. Return response IMMEDIATELY
 * 6. Enqueue persistence job (async)
 */
export const sendMessageHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { message } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: "Message content is required" });
    }

    // ── Step 1: Verify ownership ─────────────────────────────────────────────
    const conversation = await getConversationById(conversationId, userId);

    // ── Step 2: Load message history (Redis → DB) ────────────────────────────
    let previousMessages = await getCachedMessages(conversationId);
    if (!previousMessages) {
      previousMessages = await getMessages(conversationId, userId);
      await setCachedMessages(conversationId, previousMessages);
    }

    // ── Step 3: Load learning context (Redis → DB) ───────────────────────────
    let learningContext = await getCachedLearningContext(conversationId);
    if (!learningContext) {
      learningContext = await getLearningContext(conversationId, userId);
      if (learningContext) await setCachedLearningContext(conversationId, learningContext);
    }

    // ── Step 4: Load roadmap (Redis → DB rawJson) ────────────────────────────
    let roadmapJson = await getCachedRoadmap(conversationId);
    if (!roadmapJson && conversation.roadmap) {
      roadmapJson = conversation.roadmap.rawJson;
      await setCachedRoadmap(conversationId, roadmapJson);
    }

    // ── Step 5: Call AI and start stream ─────────────────────────────────────
    const contextToUse = learningContext || {};
    const stream = await continueConversation(
      message,
      contextToUse,
      roadmapJson,
      previousMessages
    );

    // ── Step 6: Assign stable IDs ─────────────────────────────────────────────
    const { humanMessageId, aiMessageId } = createMessageIds();
    const now = new Date().toISOString();

    const wantsStream =
      req.headers.accept?.includes("text/event-stream") ||
      req.query.stream === "true" ||
      req.body.stream === true;

    if (wantsStream) {
      // ── Step 7: Setup SSE headers ─────────────────────────────────────────────
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Send initial metadata
      res.write(`data: ${JSON.stringify({ type: "metadata", messageId: aiMessageId, conversationId })}\n\n`);

      // ── Step 8: Stream response chunks ────────────────────────────────────────
      let fullResponse = "";
      for await (const chunk of stream) {
        const content = chunk.content;
        if (content) {
          fullResponse += content;
          res.write(`data: ${JSON.stringify({ type: "chunk", content })}\n\n`);
        }
      }

      // End stream
      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      res.end();

      // ── Step 9: Enqueue persistence (async, after response sent) ──────────────
      await enqueuePersistenceJob({
        conversationId,
        userId,
        humanMessage: {
          id: humanMessageId,
          content: message,
          createdAt: now,
        },
        aiMessage: {
          id: aiMessageId,
          content: fullResponse,
          metadata: { type: "chat" },
          createdAt: new Date().toISOString(),
        },
      });
    } else {
      // JSON response mode (collect full stream)
      let fullResponse = "";
      for await (const chunk of stream) {
        const content = chunk.content;
        if (content) {
          fullResponse += content;
        }
      }

      // Enqueue persistence (async)
      await enqueuePersistenceJob({
        conversationId,
        userId,
        humanMessage: {
          id: humanMessageId,
          content: message,
          createdAt: now,
        },
        aiMessage: {
          id: aiMessageId,
          content: fullResponse,
          metadata: { type: "chat" },
          createdAt: new Date().toISOString(),
        },
      });

      return res.status(200).json({
        messageId: aiMessageId,
        message: fullResponse,
        conversationId,
        createdAt: now,
      });
    }
  } catch (err) {
    if (err.message === "Forbidden") return res.status(403).json({ message: "Forbidden" });
    if (err.message === "Conversation not found")
      return res.status(404).json({ message: "Conversation not found" });
    console.error("sendMessage error:", err.message);
    // Only send error if response hasn't been sent yet
    if (!res.headersSent) {
      return res.status(503).json({ message: "AI service temporarily unavailable" });
    }
  }
};

// ─── Learning Context ─────────────────────────────────────────────────────────

/**
 * POST /api/ai/conversations/:conversationId/context
 * Saves questionnaire answers for a conversation.
 */
export const saveLearningContextHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const {
      learningGoal,
      motivation,
      currentLevel,
      existingSkills,
      currentlyLearning,
      nextToLearn,
      depthPreference,
      weeklyHours,
      targetOutcome,
      preferences,
    } = req.body;

    if (!learningGoal || !currentLevel) {
      return res.status(400).json({
        message: "learningGoal and currentLevel are required",
      });
    }

    const contextData = {
      learningGoal,
      motivation,
      currentLevel,
      existingSkills: Array.isArray(existingSkills) ? existingSkills : [],
      currentlyLearning,
      nextToLearn,
      depthPreference: depthPreference || "balanced",
      weeklyHours: weeklyHours ? parseInt(weeklyHours) : null,
      targetOutcome,
      preferences,
    };

    const context = await saveLearningContext(conversationId, userId, contextData);

    // Cache the learning context
    await setCachedLearningContext(conversationId, context);

    return res.status(200).json({
      message: "Learning context saved",
      context,
    });
  } catch (err) {
    if (err.message === "Forbidden") return res.status(403).json({ message: "Forbidden" });
    if (err.message === "Conversation not found")
      return res.status(404).json({ message: "Conversation not found" });
    console.error("saveLearningContext error:", err.message);
    return res.status(500).json({ message: "Failed to save learning context" });
  }
};

/**
 * GET /api/ai/conversations/:conversationId/context
 * Returns the learning context for a conversation.
 */
export const getLearningContextHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    // Try cache first
    const cached = await getCachedLearningContext(conversationId);
    if (cached) return res.status(200).json({ context: cached });

    const context = await getLearningContext(conversationId, userId);

    if (!context) {
      return res.status(404).json({ message: "Learning context not found" });
    }

    await setCachedLearningContext(conversationId, context);
    return res.status(200).json({ context });
  } catch (err) {
    if (err.message === "Forbidden") return res.status(403).json({ message: "Forbidden" });
    console.error("getLearningContext error:", err.message);
    return res.status(500).json({ message: "Failed to fetch learning context" });
  }
};

// ─── Roadmap ──────────────────────────────────────────────────────────────────

/**
 * POST /api/ai/conversations/:conversationId/roadmap
 * Generates (or regenerates) the AI learning roadmap.
 * Requires learning context to exist first.
 */
export const generateRoadmapHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    // Initial roadmap generation legitimately has no input body. Default to an
    // empty object so only the optional modification request is read.
    const { modificationRequest } = req.body || {};

    // Verify ownership
    const conversation = await getConversationById(conversationId, userId);

    // Load learning context (required)
    let learningContext = await getCachedLearningContext(conversationId);
    if (!learningContext) {
      learningContext = await getLearningContext(conversationId, userId);
    }

    if (!learningContext) {
      return res.status(400).json({
        message:
          "Learning context is required before generating a roadmap. Please submit your questionnaire answers first.",
      });
    }

    // Load message history
    let previousMessages = await getCachedMessages(conversationId);
    if (!previousMessages) {
      previousMessages = await getMessages(conversationId, userId);
    }

    let roadmapData;
    let changesSummary = null;

    if (modificationRequest && conversation.roadmap) {
      // ── Modification path ──────────────────────────────────────────────────
      const existingRoadmapJson = conversation.roadmap.rawJson;
      const currentVersion = conversation.roadmap.version;

      const modResult = await modifyRoadmap(
        learningContext,
        existingRoadmapJson,
        currentVersion,
        modificationRequest,
        previousMessages
      );

      roadmapData = modResult.roadmap;
      changesSummary = modResult.changesSummary;

      // Save updated roadmap
      const savedRoadmap = await saveRoadmap(
        conversationId,
        userId,
        roadmapData,
        changesSummary
      );

      // Update cache
      await setCachedRoadmap(conversationId, savedRoadmap.rawJson);

      // Persist the modification request + AI summary as messages
      const { humanMessageId, aiMessageId } = createMessageIds();
      const summaryMessage = `I've updated your roadmap: ${changesSummary}\n\nRemoved: ${modResult.removedTopics?.join(", ") || "None"}\nAdded: ${modResult.addedTopics?.join(", ") || "None"}`;

      await enqueuePersistenceJob({
        conversationId,
        userId,
        humanMessage: {
          id: humanMessageId,
          content: modificationRequest,
          createdAt: new Date().toISOString(),
        },
        aiMessage: {
          id: aiMessageId,
          content: summaryMessage,
          metadata: { type: "roadmap_modification", version: currentVersion + 1 },
          createdAt: new Date().toISOString(),
        },
      });

      return res.status(200).json({
        message: "Roadmap updated",
        roadmap: savedRoadmap,
        changesSummary,
        removedTopics: modResult.removedTopics,
        addedTopics: modResult.addedTopics,
      });
    } else {
      // ── First-time generation path ─────────────────────────────────────────
      const wantsStream = req.headers.accept?.includes("text/event-stream");

      if (wantsStream) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache, no-transform");
        res.setHeader("Connection", "keep-alive");
        res.setHeader("X-Accel-Buffering", "no");
        res.flushHeaders?.();

        const sendEvent = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);
        sendEvent({ type: "status", message: "Analyzing your learning profile…" });

        roadmapData = await generateRoadmapStream(
          learningContext,
          (content) => sendEvent({ type: "chunk", content })
        );
        sendEvent({ type: "status", message: "Organizing your learning milestones…" });

        const savedRoadmap = await saveRoadmap(conversationId, userId, roadmapData);
        await setCachedRoadmap(conversationId, savedRoadmap.rawJson);

        const { humanMessageId, aiMessageId } = createMessageIds();
        await enqueuePersistenceJob({
          conversationId,
          userId,
          humanMessage: {
            id: humanMessageId,
            content: "Generate my personalized learning roadmap",
            createdAt: new Date().toISOString(),
          },
          aiMessage: {
            id: aiMessageId,
            content: `I've generated your personalized learning roadmap for: ${roadmapData.objective}`,
            metadata: { type: "roadmap_generated", version: 1 },
            createdAt: new Date().toISOString(),
          },
        });

        const { phases, ...roadmapMeta } = roadmapData;
        sendEvent({ type: "roadmap-meta", roadmap: roadmapMeta });
        for (const phase of roadmapData.phases) {
          sendEvent({ type: "phase", phase });
        }
        sendEvent({ type: "roadmap", roadmap: savedRoadmap });
        sendEvent({ type: "done" });
        return res.end();
      }

      roadmapData = await generateRoadmap(learningContext, previousMessages);

      const savedRoadmap = await saveRoadmap(conversationId, userId, roadmapData);

      // Cache the roadmap
      await setCachedRoadmap(conversationId, savedRoadmap.rawJson);

      // Persist generation as a system message pair
      const { humanMessageId, aiMessageId } = createMessageIds();
      await enqueuePersistenceJob({
        conversationId,
        userId,
        humanMessage: {
          id: humanMessageId,
          content: "Generate my personalized learning roadmap",
          createdAt: new Date().toISOString(),
        },
        aiMessage: {
          id: aiMessageId,
          content: `I've generated your personalized learning roadmap for: ${roadmapData.objective}`,
          metadata: { type: "roadmap_generated", version: 1 },
          createdAt: new Date().toISOString(),
        },
      });

      return res.status(201).json({
        message: "Roadmap generated",
        roadmap: savedRoadmap,
      });
    }
  } catch (err) {
    if (err.message === "Forbidden") return res.status(403).json({ message: "Forbidden" });
    if (err.message === "Conversation not found")
      return res.status(404).json({ message: "Conversation not found" });
    console.error("generateRoadmap error:", err.message);
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: "error", message: "Failed to generate roadmap. Please try again." })}\n\n`);
      return res.end();
    }
    const isConfigurationError =
      /api key|unauthorized|authentication|forbidden/i.test(err.message || "");
    return res.status(503).json({
      message: isConfigurationError
        ? "The AI service credentials are invalid or unavailable. Check MISTRAL_API_KEY on the server."
        : "Failed to generate roadmap. Please try again.",
    });
  }
};

/**
 * GET /api/ai/conversations/:conversationId/roadmap
 * Returns the current roadmap with all phases and topics.
 */
export const getRoadmapHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    // Try cache first
    const cachedRoadmap = await getCachedRoadmap(conversationId);
    if (cachedRoadmap) {
      return res.status(200).json({ roadmap: cachedRoadmap, source: "cache" });
    }

    const roadmap = await getRoadmap(conversationId, userId);

    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    await setCachedRoadmap(conversationId, roadmap.rawJson);

    return res.status(200).json({ roadmap, source: "database" });
  } catch (err) {
    if (err.message === "Forbidden") return res.status(403).json({ message: "Forbidden" });
    console.error("getRoadmap error:", err.message);
    return res.status(500).json({ message: "Failed to fetch roadmap" });
  }
};

// ─── Topic Cross-Questioning ──────────────────────────────────────────────────

/**
 * POST /api/ai/conversations/:conversationId/topics/:topicId/questions
 *
 * Answers a user's question about a specific roadmap topic.
 * Response is grounded in: user profile + roadmap + topic + conversation history.
 */
export const askTopicQuestionHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId, topicId } = req.params;
    const { question } = req.body;

    if (!question?.trim()) {
      return res.status(400).json({ message: "Question is required" });
    }

    // Load topic with ownership verification
    const { topic, phase, roadmap } = await getTopicByTopicId(
      conversationId,
      topicId,
      userId
    );

    // Load learning context
    let learningContext = await getCachedLearningContext(conversationId);
    if (!learningContext) {
      learningContext = await getLearningContext(conversationId, userId);
    }

    // Load conversation history
    let previousMessages = await getCachedMessages(conversationId);
    if (!previousMessages) {
      previousMessages = await getMessages(conversationId, userId);
    }

    // Get full roadmap JSON for context
    let roadmapJson = await getCachedRoadmap(conversationId);
    if (!roadmapJson) {
      roadmapJson = roadmap.rawJson;
    }

    // Call AI
    const aiResponse = await askTopicQuestion(
      learningContext || {},
      roadmapJson,
      topic,
      question,
      previousMessages
    );

    // Return response immediately
    res.status(200).json({
      answer: aiResponse,
      topicId,
      topicTitle: topic.title,
      conversationId,
    });

    // Persist the exchange asynchronously
    const { humanMessageId, aiMessageId } = createMessageIds();
    await enqueuePersistenceJob({
      conversationId,
      userId,
      humanMessage: {
        id: humanMessageId,
        content: `[Topic: ${topic.title}] ${question}`,
        metadata: { type: "topic_question", topicId },
        createdAt: new Date().toISOString(),
      },
      aiMessage: {
        id: aiMessageId,
        content: aiResponse,
        metadata: { type: "topic_answer", topicId },
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    if (err.message === "Forbidden") return res.status(403).json({ message: "Forbidden" });
    if (err.message === "Conversation not found")
      return res.status(404).json({ message: "Conversation not found" });
    if (err.message?.includes("not found in roadmap"))
      return res.status(404).json({ message: err.message });
    console.error("askTopicQuestion error:", err.message);
    if (!res.headersSent) {
      return res.status(503).json({ message: "AI service temporarily unavailable" });
    }
  }
};
