import prisma from "../configs/prisma.js";

// ─── Conversation CRUD ────────────────────────────────────────────────────────

/**
 * Creates a new conversation for a user.
 */
export async function createConversation(userId, title = "New Learning Path") {
  return prisma.conversation.create({
    data: {
      userId,
      title,
      status: "ACTIVE",
    },
  });
}

/**
 * Lists all conversations for a user (most recent first).
 */
export async function getConversations(userId) {
  return prisma.conversation.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
      // Include whether roadmap exists
      roadmap: { select: { id: true, version: true, objective: true } },
    },
  });
}

/**
 * Fetches a single conversation with ownership check.
 * Throws if not found or doesn't belong to userId.
 */
export async function getConversationById(conversationId, userId) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      learningContext: true,
      roadmap: {
        include: {
          phases: {
            orderBy: { order: "asc" },
            include: {
              topics: { orderBy: { order: "asc" } },
            },
          },
        },
      },
    },
  });

  if (!conversation) throw new Error("Conversation not found");
  if (conversation.userId !== userId) throw new Error("Forbidden");

  return conversation;
}

/**
 * Deletes a conversation (hard delete — cascades to messages, context, roadmap).
 * Verifies ownership before deletion.
 */
export async function deleteConversation(conversationId, userId) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { userId: true },
  });

  if (!conversation) throw new Error("Conversation not found");
  if (conversation.userId !== userId) throw new Error("Forbidden");

  return prisma.conversation.delete({ where: { id: conversationId } });
}

// ─── Messages ─────────────────────────────────────────────────────────────────

/**
 * Retrieves all messages for a conversation, ordered chronologically.
 * Verifies ownership.
 */
export async function getMessages(conversationId, userId) {
  // Ownership check
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { userId: true },
  });
  if (!conversation) throw new Error("Conversation not found");
  if (conversation.userId !== userId) throw new Error("Forbidden");

  return prisma.conversationMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Saves a batch of messages (human + AI) to the database.
 * Used by the persistence worker — idempotent via message ID.
 */
export async function saveMessages(conversationId, messages) {
  // Use createMany with skipDuplicates for idempotency
  return prisma.conversationMessage.createMany({
    data: messages.map((msg) => ({
      id: msg.id, // pre-assigned stable ID for idempotency
      conversationId,
      role: msg.role,
      content: msg.content,
      metadata: msg.metadata || null,
      createdAt: msg.createdAt ? new Date(msg.createdAt) : new Date(),
    })),
    skipDuplicates: true, // Prevents duplicate inserts on worker retry
  });
}

/**
 * Bumps a conversation's updatedAt timestamp.
 */
export async function touchConversation(conversationId) {
  return prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });
}

// ─── Learning Context ─────────────────────────────────────────────────────────

/**
 * Fetches learning context (questionnaire) for a conversation.
 * Verifies ownership.
 */
export async function getLearningContext(conversationId, userId) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { userId: true },
  });
  if (!conversation) throw new Error("Conversation not found");
  if (conversation.userId !== userId) throw new Error("Forbidden");

  return prisma.learningContext.findUnique({ where: { conversationId } });
}

/**
 * Creates or updates the learning context for a conversation.
 * Also updates conversation title based on the learning goal.
 */
export async function saveLearningContext(conversationId, userId, contextData) {
  // Verify ownership
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { userId: true },
  });
  if (!conversation) throw new Error("Conversation not found");
  if (conversation.userId !== userId) throw new Error("Forbidden");

  const [context] = await prisma.$transaction([
    prisma.learningContext.upsert({
      where: { conversationId },
      create: {
        conversationId,
        userId,
        ...contextData,
      },
      update: {
        ...contextData,
        updatedAt: new Date(),
      },
    }),
    // Update conversation title to reflect the learning goal
    prisma.conversation.update({
      where: { id: conversationId },
      data: {
        title: contextData.learningGoal
          ? `Learning: ${contextData.learningGoal.substring(0, 60)}`
          : undefined,
        updatedAt: new Date(),
      },
    }),
  ]);

  return context;
}

// ─── Roadmap ──────────────────────────────────────────────────────────────────

/**
 * Fetches the roadmap for a conversation, with phases and topics.
 * Verifies ownership.
 */
export async function getRoadmap(conversationId, userId) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { userId: true },
  });
  if (!conversation) throw new Error("Conversation not found");
  if (conversation.userId !== userId) throw new Error("Forbidden");

  return prisma.roadmap.findUnique({
    where: { conversationId },
    include: {
      phases: {
        orderBy: { order: "asc" },
        include: {
          topics: { orderBy: { order: "asc" } },
        },
      },
    },
  });
}

/**
 * Saves (upserts) a roadmap and its phases/topics.
 * On update, increments the version and saves the old JSON to changeHistory.
 *
 * @param {string} conversationId
 * @param {string} userId
 * @param {object} roadmapData - Validated roadmap JSON from AI
 * @param {string|null} changesSummary - For modifications, summary of what changed
 */
export async function saveRoadmap(conversationId, userId, roadmapData, changesSummary = null) {
  const existing = await prisma.roadmap.findUnique({ where: { conversationId } });

  if (existing) {
    // Modification path — increment version, archive old JSON
    const oldHistory = Array.isArray(existing.changeHistory) ? existing.changeHistory : [];
    const newHistoryEntry = {
      version: existing.version,
      savedAt: new Date().toISOString(),
      changesSummary: changesSummary || "User-requested modification",
      snapshot: existing.rawJson,
    };

    return prisma.$transaction(async (tx) => {
      // Delete old phases (cascade deletes topics)
      await tx.roadmapPhase.deleteMany({ where: { roadmapId: existing.id } });

      // Update roadmap metadata
      const updatedRoadmap = await tx.roadmap.update({
        where: { conversationId },
        data: {
          objective: roadmapData.objective,
          currentAssessment: roadmapData.currentAssessment,
          finalOutcome: roadmapData.finalOutcome,
          totalEstimatedWeeks: roadmapData.totalEstimatedWeeks,
          rawJson: roadmapData,
          version: { increment: 1 },
          changeHistory: [...oldHistory, newHistoryEntry],
          updatedAt: new Date(),
        },
      });

      // Re-create phases and topics
      await createPhasesAndTopics(tx, updatedRoadmap.id, roadmapData.phases);

      return tx.roadmap.findUnique({
        where: { id: updatedRoadmap.id },
        include: {
          phases: {
            orderBy: { order: "asc" },
            include: { topics: { orderBy: { order: "asc" } } },
          },
        },
      });
    });
  } else {
    // First-time creation
    return prisma.$transaction(async (tx) => {
      const roadmap = await tx.roadmap.create({
        data: {
          conversationId,
          userId,
          objective: roadmapData.objective,
          currentAssessment: roadmapData.currentAssessment,
          finalOutcome: roadmapData.finalOutcome,
          totalEstimatedWeeks: roadmapData.totalEstimatedWeeks,
          rawJson: roadmapData,
          version: 1,
        },
      });

      await createPhasesAndTopics(tx, roadmap.id, roadmapData.phases);

      return tx.roadmap.findUnique({
        where: { id: roadmap.id },
        include: {
          phases: {
            orderBy: { order: "asc" },
            include: { topics: { orderBy: { order: "asc" } } },
          },
        },
      });
    });
  }
}

/**
 * Finds a specific topic by topicId within a conversation's roadmap.
 * Returns the topic with its phase info.
 */
export async function getTopicByTopicId(conversationId, topicId, userId) {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { userId: true },
  });
  if (!conversation) throw new Error("Conversation not found");
  if (conversation.userId !== userId) throw new Error("Forbidden");

  const roadmap = await prisma.roadmap.findUnique({
    where: { conversationId },
    include: {
      phases: {
        include: {
          topics: { where: { topicId } },
        },
      },
    },
  });

  if (!roadmap) throw new Error("Roadmap not found");

  for (const phase of roadmap.phases) {
    if (phase.topics.length > 0) {
      return { topic: phase.topics[0], phase, roadmap };
    }
  }

  throw new Error(`Topic '${topicId}' not found in roadmap`);
}

// ─── Private helper ───────────────────────────────────────────────────────────

/**
 * Creates phases and topics within a Prisma transaction.
 */
async function createPhasesAndTopics(tx, roadmapId, phases) {
  for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex++) {
    const phase = phases[phaseIndex];

    const createdPhase = await tx.roadmapPhase.create({
      data: {
        roadmapId,
        phaseId: phase.phaseId,
        title: phase.title,
        description: phase.description,
        order: phaseIndex + 1,
        estimatedWeeks: phase.estimatedWeeks,
      },
    });

    const topics = phase.topics || [];
    for (let topicIndex = 0; topicIndex < topics.length; topicIndex++) {
      const topic = topics[topicIndex];

      // Normalize subtopics — AI may return strings or objects
      const normalizedSubtopics = (topic.subtopics || []).map((s) =>
        typeof s === "string" ? s : s.title || JSON.stringify(s)
      );

      await tx.roadmapTopic.create({
        data: {
          phaseId: createdPhase.id,
          topicId: topic.topicId,
          title: topic.title,
          description: topic.description,
          whyThisExists: topic.whyThisExists,
          difficulty: topic.difficulty || "beginner",
          estimatedHours: topic.estimatedHours,
          prerequisites: topic.prerequisites || [],
          subtopics: normalizedSubtopics,
          projects: topic.projects || [],
          isMilestone: topic.isMilestone || false,
          order: topicIndex + 1,
        },
      });
    }
  }
}
