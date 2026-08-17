import { getPersistenceQueue } from "../configs/bullmq.js";
import { randomUUID } from "crypto";

/**
 * Enqueues a persistence job to save human + AI messages to PostgreSQL.
 *
 * The jobId is deterministic based on conversationId + human message ID
 * to prevent duplicate DB inserts if the same job is enqueued twice.
 *
 * @param {object} jobData
 * @param {string} jobData.conversationId
 * @param {string} jobData.userId
 * @param {object} jobData.humanMessage - { id, content, createdAt }
 * @param {object} jobData.aiMessage    - { id, content, metadata, createdAt }
 * @param {object|null} jobData.roadmapUpdate - Optional: updated roadmap + changesSummary
 */
export async function enqueuePersistenceJob(jobData) {
  try {
    const queue = getPersistenceQueue();

    // Stable job ID: prevents duplicate processing on retry
    const jobId = `persist-${jobData.conversationId}-${jobData.humanMessage.id}`;

    await queue.add("persist-messages", jobData, {
      jobId,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    });

    return jobId;
  } catch (err) {
    // Queue failure is logged but non-fatal — we've already returned the AI response to the user.
    // The message may be lost if both queue and DB are unavailable, but this is an edge case.
    console.error("⚠️  Failed to enqueue persistence job:", err.message);
    return null;
  }
}

/**
 * Creates stable, pre-assigned IDs for a message pair.
 * These IDs are used for idempotent DB inserts (skipDuplicates).
 */
export function createMessageIds() {
  return {
    humanMessageId: randomUUID(),
    aiMessageId: randomUUID(),
  };
}
