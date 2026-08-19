import { z } from "zod";

// ─── Subtopic schema ───────────────────────────────────────────────────────────
const SubtopicSchema = z.object({
  title: z.string().describe("Name of the subtopic"),
  description: z.string().optional().describe("Brief explanation of this subtopic"),
});

// ─── Topic schema ──────────────────────────────────────────────────────────────
export const RoadmapTopicSchema = z.object({
  topicId: z
    .string()
    .describe("Stable unique identifier for this topic, e.g. 'topic-001'. Use this format consistently."),
  title: z.string().describe("Clear, concise topic title"),
  description: z
    .string()
    .describe("What this topic covers and what the learner will be able to do after completing it"),
  whyThisExists: z
    .string()
    .describe(
      "A clear, specific explanation of why this topic is included in THIS user's roadmap based on their goals"
    ),
  prerequisites: z
    .array(z.string())
    .default([])
    .describe("Array of topicId strings that must be completed before this topic"),
  difficulty: z
    .enum(["beginner", "intermediate", "advanced"])
    .describe("Difficulty level of this topic"),
  estimatedHours: z
    .number()
    .int()
    .positive()
    .describe("Estimated hours to learn this topic thoroughly"),
  subtopics: z
    .array(z.union([z.string(), SubtopicSchema]))
    .default([])
    .describe("Key sub-concepts within this topic"),
  projects: z
    .array(z.string())
    .default([])
    .describe("Practical exercises or mini-projects for this topic"),
  isMilestone: z
    .boolean()
    .default(false)
    .describe("Whether completing this topic marks a significant checkpoint"),
});

// ─── Phase schema ──────────────────────────────────────────────────────────────
export const RoadmapPhaseSchema = z.object({
  phaseId: z
    .string()
    .describe("Stable unique identifier for this phase, e.g. 'phase-1'"),
  title: z.string().describe("Phase title, e.g. 'Foundations', 'Core Concepts', 'Advanced Topics'"),
  description: z
    .string()
    .describe("What this phase focuses on and what skills the user gains by completing it"),
  estimatedWeeks: z
    .number()
    .int()
    .positive()
    .describe("Estimated number of weeks to complete this phase"),
  topics: z.array(RoadmapTopicSchema).min(1).describe("Ordered list of topics in this phase"),
});

// ─── Full roadmap schema ───────────────────────────────────────────────────────
export const RoadmapSchema = z.object({
  objective: z
    .string()
    .describe("A one-sentence summary of what the user will achieve with this roadmap"),
  currentAssessment: z
    .string()
    .describe(
      "A brief assessment of the user's current skill level and what they already know, based on their questionnaire"
    ),
  phases: z
    .array(RoadmapPhaseSchema)
    .min(1)
    .describe("Ordered learning phases from foundational to advanced"),
  finalOutcome: z
    .string()
    .describe("Detailed description of what the user will be able to build or do after completing the roadmap"),
  totalEstimatedWeeks: z
    .number()
    .int()
    .positive()
    .describe("Total estimated weeks to complete the entire roadmap"),
});

// ─── Modified roadmap schema ───────────────────────────────────────────────────
export const ModifiedRoadmapSchema = z.object({
  roadmap: RoadmapSchema.describe("The complete updated roadmap"),
  changesSummary: z
    .string()
    .describe("A clear explanation of what was changed in this version and why"),
  removedTopics: z
    .array(z.string())
    .default([])
    .describe("Topic titles that were removed in this modification"),
  addedTopics: z
    .array(z.string())
    .default([])
    .describe("Topic titles that were added in this modification"),
});
