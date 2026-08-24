import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { JsonOutputParser, StructuredOutputParser } from "@langchain/core/output_parsers";
import llm from "./llm.js";
import {
  roadmapGenerationPrompt,
  topicExplanationPrompt,
  crossQuestioningPrompt,
  roadmapModificationPrompt,
  followUpConversationPrompt,
} from "./prompts/roadmap.prompt.js";
import { RoadmapSchema, ModifiedRoadmapSchema } from "./schemas/roadmap.schema.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Converts stored DB messages to LangChain message objects.
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Array<HumanMessage|AIMessage>}
 */
function buildMessageHistory(messages = []) {
  return messages.map((msg) =>
    msg.role === "HUMAN" ? new HumanMessage(msg.content) : new AIMessage(msg.content)
  );
}

/**
 * Formats message history into a readable string for prompt injection.
 * @param {Array<{role: string, content: string}>} messages
 * @returns {string}
 */
function formatConversationHistory(messages = []) {
  if (!messages || messages.length === 0) return "No previous conversation.";
  return messages
    .map((msg) => `${msg.role === "HUMAN" ? "User" : "AI"}: ${msg.content}`)
    .join("\n\n");
}

/**
 * Builds a summary of phases for injection into short-context prompts.
 * @param {object} roadmap - Full roadmap JSON
 * @returns {string}
 */
function buildPhasesSummary(roadmap) {
  if (!roadmap?.phases) return "No phases available.";
  return roadmap.phases
    .map(
      (p) =>
        `Phase ${p.phaseId}: ${p.title} — Topics: ${p.topics.map((t) => `${t.topicId}:${t.title}`).join(", ")}`
    )
    .join("\n");
}

/**
 * Normalizes learning context fields for prompt injection.
 * Handles missing optional fields gracefully.
 */
function normalizeLearningContext(ctx) {
  return {
    learningGoal: ctx.learningGoal || "Not specified",
    motivation: ctx.motivation || "Not specified",
    currentLevel: ctx.currentLevel || "beginner",
    existingSkills: Array.isArray(ctx.existingSkills)
      ? ctx.existingSkills.join(", ") || "None"
      : ctx.existingSkills || "None",
    currentlyLearning: ctx.currentlyLearning || "Nothing currently",
    nextToLearn: ctx.nextToLearn || "Not specified",
    depthPreference: ctx.depthPreference || "balanced",
    weeklyHours: ctx.weeklyHours ? `${ctx.weeklyHours} hours/week` : "Not specified",
    targetOutcome: ctx.targetOutcome || "Not specified",
    preferences: ctx.preferences || "None",
  };
}

/**
 * Converts common model response variants to the one persisted roadmap shape.
 * Some models return `{ userProfile, roadmap: { title, totalWeeks, phases } }`
 * despite being asked for the application's top-level schema.
 */
function normalizeRoadmapOutput(output) {
  const source = output?.roadmap || output || {};
  const profile = output?.userProfile || {};
  const phases = Array.isArray(source.phases) ? source.phases : [];

  const normalizedPhases = phases.map((phase, phaseIndex) => ({
    phaseId: phase.phaseId || `phase-${phaseIndex + 1}`,
    title: phase.title || `Phase ${phaseIndex + 1}`,
    description: phase.description || "",
    estimatedWeeks: Math.max(1, Number(phase.estimatedWeeks) || 1),
    topics: (Array.isArray(phase.topics) ? phase.topics : []).map((topic, topicIndex) => ({
      topicId: topic.topicId || `topic-${String(phaseIndex * 100 + topicIndex + 1).padStart(3, "0")}`,
      title: topic.title || `Topic ${topicIndex + 1}`,
      description: topic.description || "",
      whyThisExists: topic.whyThisExists || "This topic supports the learning objective.",
      prerequisites: Array.isArray(topic.prerequisites) ? topic.prerequisites : [],
      difficulty: ["beginner", "intermediate", "advanced"].includes(topic.difficulty)
        ? topic.difficulty
        : "beginner",
      estimatedHours: Math.max(1, Number(topic.estimatedHours) || 1),
      subtopics: Array.isArray(topic.subtopics) ? topic.subtopics : [],
      projects: Array.isArray(topic.projects)
        ? topic.projects
        : (Array.isArray(topic.practice)
          ? topic.practice.map((item) => typeof item === "string" ? item : item?.description).filter(Boolean)
          : []),
      isMilestone: Boolean(topic.isMilestone),
    })),
  }));

  return {
    objective: source.objective || source.title || `Learning roadmap for ${profile.learningGoal || "your goal"}`,
    currentAssessment: source.currentAssessment || source.description || "Assessment based on the provided learning profile.",
    phases: normalizedPhases,
    finalOutcome: source.finalOutcome || profile.targetOutcome || source.description || "Complete the learning roadmap.",
    totalEstimatedWeeks: Math.max(
      1,
      Number(source.totalEstimatedWeeks || source.totalWeeks) ||
        normalizedPhases.reduce((total, phase) => total + phase.estimatedWeeks, 0)
    ),
  };
}

// ─── AI Service Functions ─────────────────────────────────────────────────────

/**
 * Generates a structured learning roadmap using LangChain structured output.
 * Uses Zod schema to guarantee predictable JSON output.
 *
 * @param {object} learningContext - Questionnaire answers from the user
 * @param {Array} previousMessages - Existing conversation messages (usually empty for first generation)
 * @returns {object} Validated roadmap JSON matching RoadmapSchema
 */
export async function generateRoadmap(learningContext, previousMessages = []) {
  const formatParser = StructuredOutputParser.fromZodSchema(RoadmapSchema);
  const jsonParser = new JsonOutputParser();

  const ctx = normalizeLearningContext(learningContext);
  const promptInput = {
    ...ctx,
    formatInstructions: formatParser.getFormatInstructions(),
  };
  const messages = await roadmapGenerationPrompt.formatMessages(promptInput);
  const response = await llm.invoke(messages, {
    response_format: { type: "json_object" },
  });
  const result = await jsonParser.parse(response.text);
  return RoadmapSchema.parse(normalizeRoadmapOutput(result));
}

/**
 * Generates the same validated roadmap while forwarding model tokens to the
 * caller. The caller can use those chunks to provide a live SSE experience.
 */
export async function generateRoadmapStream(learningContext, onChunk) {
  const formatParser = StructuredOutputParser.fromZodSchema(RoadmapSchema);
  const jsonParser = new JsonOutputParser();
  const ctx = normalizeLearningContext(learningContext);
  const messages = await roadmapGenerationPrompt.formatMessages({
    ...ctx,
    formatInstructions: formatParser.getFormatInstructions(),
  });

  const stream = await llm.stream(messages, {
    response_format: { type: "json_object" },
  });

  let rawJson = "";
  for await (const chunk of stream) {
    const content = getMessageText(chunk.content);
    if (!content) continue;

    rawJson += content;
    await onChunk?.(content);
  }

  const result = await jsonParser.parse(rawJson);
  return RoadmapSchema.parse(normalizeRoadmapOutput(result));
}

/**
 * Answers a question about a specific topic in the user's roadmap.
 * Grounds the answer in the roadmap, topic details, and conversation history.
 *
 * @param {object} learningContext - User's questionnaire answers
 * @param {object} roadmap - Full roadmap JSON
 * @param {object} topic - The specific topic being asked about
 * @param {string} question - The user's question
 * @param {Array} previousMessages - Previous conversation messages
 * @returns {string} AI response text
 */
export async function askTopicQuestion(learningContext, roadmap, topic, question, previousMessages = []) {
  const chain = topicExplanationPrompt.pipe(llm);
  const ctx = normalizeLearningContext(learningContext);

  // Find the phase this topic belongs to
  const parentPhase = roadmap.phases?.find((p) =>
    p.topics?.some((t) => t.topicId === topic.topicId)
  );

  const result = await chain.invoke({
    ...ctx,
    roadmapObjective: roadmap.objective || "Not available",
    roadmapPhasesSummary: buildPhasesSummary(roadmap),
    topicId: topic.topicId,
    topicTitle: topic.title,
    topicDescription: topic.description || "Not provided",
    whyThisExists: topic.whyThisExists || "Not provided",
    topicPrerequisites:
      topic.prerequisites?.length > 0 ? topic.prerequisites.join(", ") : "None",
    topicPhase: parentPhase ? `${parentPhase.phaseId}: ${parentPhase.title}` : "Unknown phase",
    topicDifficulty: topic.difficulty || "Not specified",
    estimatedHours: topic.estimatedHours ? `${topic.estimatedHours} hours` : "Not estimated",
    conversationHistory: formatConversationHistory(previousMessages),
    userQuestion: question,
  });

  return result.content;
}

/**
 * Handles a general follow-up message in a conversation.
 * Uses the full roadmap and conversation history for grounding.
 * Returns a LangChain stream.
 *
 * @param {string} message - User's message
 * @param {object} learningContext - User's questionnaire answers
 * @param {object|null} roadmap - Full roadmap JSON (may be null if not yet generated)
 * @param {Array} previousMessages - Previous conversation messages
 * @returns {AsyncIterableIterator} Stream of AI response chunks
 */
export async function continueConversation(message, learningContext, roadmap, previousMessages = []) {
  // If the message is clearly a cross-questioning about the roadmap and roadmap exists,
  // use the cross-questioning prompt for better grounding
  if (roadmap && isRoadmapQuestion(message)) {
    const chain = crossQuestioningPrompt.pipe(llm);
    const ctx = normalizeLearningContext(learningContext);

    return await chain.stream({
      ...ctx,
      fullRoadmapJson: JSON.stringify(roadmap, null, 2),
      conversationHistory: formatConversationHistory(previousMessages),
      userQuestion: message,
    });
  }

  // General follow-up
  const chain = followUpConversationPrompt.pipe(llm);
  const ctx = normalizeLearningContext(learningContext);

  return await chain.stream({
    ...ctx,
    roadmapObjective: roadmap?.objective || "Roadmap not yet generated",
    conversationHistory: formatConversationHistory(previousMessages),
    userMessage: message,
  });
}

/**
 * Modifies an existing roadmap based on a user instruction.
 * Returns an updated roadmap with change history.
 *
 * @param {object} learningContext - User's questionnaire answers
 * @param {object} currentRoadmap - The existing roadmap JSON
 * @param {number} currentVersion - Current roadmap version number
 * @param {string} modificationRequest - What the user wants to change
 * @param {Array} previousMessages - Previous conversation messages
 * @returns {object} { roadmap, changesSummary, removedTopics, addedTopics }
 */
export async function modifyRoadmap(
  learningContext,
  currentRoadmap,
  currentVersion,
  modificationRequest,
  previousMessages = []
) {
  const formatParser = StructuredOutputParser.fromZodSchema(ModifiedRoadmapSchema);
  const jsonParser = new JsonOutputParser();
  const ctx = normalizeLearningContext(learningContext);

  const promptInput = {
    ...ctx,
    currentVersion,
    currentRoadmapJson: JSON.stringify(currentRoadmap, null, 2),
    conversationHistory: formatConversationHistory(previousMessages),
    modificationRequest,
    formatInstructions: formatParser.getFormatInstructions(),
  };
  const messages = await roadmapModificationPrompt.formatMessages(promptInput);
  const response = await llm.invoke(messages, {
    response_format: { type: "json_object" },
  });
  const result = await jsonParser.parse(response.text);

  return ModifiedRoadmapSchema.parse({
    ...result,
    roadmap: normalizeRoadmapOutput(result?.roadmap || result),
  });
}

// ─── Private helpers ──────────────────────────────────────────────────────────

/**
 * Simple heuristic: detect if user message is likely about their roadmap.
 */
function isRoadmapQuestion(message) {
  const roadmapKeywords = [
    "why", "skip", "need", "topic", "phase", "learn", "before", "after",
    "prerequisite", "dependency", "remove", "add", "replace", "roadmap",
    "path", "order", "important", "necessary", "already know", "what if",
  ];
  const lower = message.toLowerCase();
  return roadmapKeywords.some((kw) => lower.includes(kw));
}

function getMessageText(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";

  return content
    .map((block) => {
      if (typeof block === "string") return block;
      return block?.type === "text" ? block.text || "" : "";
    })
    .join("");
}
