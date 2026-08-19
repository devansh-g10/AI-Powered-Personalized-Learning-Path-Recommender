import { HumanMessage, AIMessage } from "@langchain/core/messages";
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
  const structuredLlm = llm.withStructuredOutput(RoadmapSchema, {
    name: "generate_learning_roadmap",
  });

  const chain = roadmapGenerationPrompt.pipe(structuredLlm);

  const ctx = normalizeLearningContext(learningContext);
  const result = await chain.invoke(ctx);
  return result;
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
 *
 * @param {string} message - User's message
 * @param {object} learningContext - User's questionnaire answers
 * @param {object|null} roadmap - Full roadmap JSON (may be null if not yet generated)
 * @param {Array} previousMessages - Previous conversation messages
 * @returns {string} AI response text
 */
export async function continueConversation(message, learningContext, roadmap, previousMessages = []) {
  // If the message is clearly a cross-questioning about the roadmap and roadmap exists,
  // use the cross-questioning prompt for better grounding
  if (roadmap && isRoadmapQuestion(message)) {
    const chain = crossQuestioningPrompt.pipe(llm);
    const ctx = normalizeLearningContext(learningContext);

    const result = await chain.invoke({
      ...ctx,
      fullRoadmapJson: JSON.stringify(roadmap, null, 2),
      conversationHistory: formatConversationHistory(previousMessages),
      userQuestion: message,
    });
    return result.content;
  }

  // General follow-up
  const chain = followUpConversationPrompt.pipe(llm);
  const ctx = normalizeLearningContext(learningContext);

  const result = await chain.invoke({
    ...ctx,
    roadmapObjective: roadmap?.objective || "Roadmap not yet generated",
    conversationHistory: formatConversationHistory(previousMessages),
    userMessage: message,
  });

  return result.content;
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
  const structuredLlm = llm.withStructuredOutput(ModifiedRoadmapSchema, {
    name: "modify_learning_roadmap",
  });

  const chain = roadmapModificationPrompt.pipe(structuredLlm);
  const ctx = normalizeLearningContext(learningContext);

  const result = await chain.invoke({
    ...ctx,
    currentVersion,
    currentRoadmapJson: JSON.stringify(currentRoadmap, null, 2),
    conversationHistory: formatConversationHistory(previousMessages),
    modificationRequest,
  });

  return result;
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
