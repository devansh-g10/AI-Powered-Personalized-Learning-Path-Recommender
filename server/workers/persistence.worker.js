/**
 * persistence.worker.js
 *
 * BullMQ Worker — processes jobs from the "persistence-queue".
 * Saves human + AI messages to PostgreSQL and updates Redis cache.
 *
 * Can be run as a standalone process:
 *   node workers/persistence.worker.js
 *
 * Or imported and started as part of the main server process.
 */

import "dotenv/config";
import { Worker } from "bullmq";
import { createBullMQConnection, closeRedis } from "../configs/redis.js";
import { PERSISTENCE_QUEUE } from "../configs/bullmq.js";
import { saveMessages, touchConversation, saveRoadmap } from "../services/conversation.service.js";
import {
  appendMessageToCache,
  setCachedRoadmap,
} from "../services/cache.service.js";

let workerInstance = null;

/**
 * Creates and starts the persistence worker.
 * Returns the worker instance for lifecycle management.
 */
export function startPersistenceWorker() {
  if (workerInstance) return workerInstance;

  // BullMQ Worker requires a dedicated Redis connection with maxRetriesPerRequest: null
  // (for blocking commands like BLPOP). Must NOT share the general cache connection.
  const connection = createBullMQConnection();

  workerInstance = new Worker(
    PERSISTENCE_QUEUE,
    async (job) => {
      const { conversationId, userId, humanMessage, aiMessage, roadmapUpdate } = job.data;

      console.log(`[Worker] Processing job ${job.id} for conversation ${conversationId}`);

      // ── Step 1: Save human + AI messages to PostgreSQL ──────────────────────
      await saveMessages(conversationId, [
        {
          id: humanMessage.id,
          role: "HUMAN",
          content: humanMessage.content,
          metadata: humanMessage.metadata || null,
          createdAt: humanMessage.createdAt,
        },
        {
          id: aiMessage.id,
          role: "AI",
          content: aiMessage.content,
          metadata: aiMessage.metadata || null,
          createdAt: aiMessage.createdAt,
        },
      ]);

      // ── Step 2: Touch conversation updatedAt ─────────────────────────────────
      await touchConversation(conversationId);

      // ── Step 3: Handle roadmap update if present ─────────────────────────────
      if (roadmapUpdate) {
        try {
          const savedRoadmap = await saveRoadmap(
            conversationId,
            userId,
            roadmapUpdate.roadmapData,
            roadmapUpdate.changesSummary
          );
          // Update roadmap in Redis cache
          await setCachedRoadmap(conversationId, savedRoadmap.rawJson);
        } catch (roadmapErr) {
          // Log but don't fail the whole job — messages are already saved
          console.error(`[Worker] Roadmap save failed for ${conversationId}:`, roadmapErr.message);
        }
      }

      // ── Step 4: Update Redis message cache ───────────────────────────────────
      await appendMessageToCache(
        conversationId,
        { role: "HUMAN", content: humanMessage.content, createdAt: humanMessage.createdAt },
        { role: "AI", content: aiMessage.content, createdAt: aiMessage.createdAt }
      );

      console.log(`[Worker] ✅ Job ${job.id} completed for conversation ${conversationId}`);
    },
    {
      connection,
      concurrency: 5, // Process up to 5 jobs simultaneously
      // Graceful shutdown: finish processing current jobs before exiting
      settings: {
        backoffStrategy: (attemptsMade) => Math.pow(2, attemptsMade) * 1000, // 1s, 2s, 4s
      },
    }
  );

  workerInstance.on("completed", (job) => {
    console.log(`[Worker] Job ${job.id} completed successfully.`);
  });

  workerInstance.on("failed", (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed (attempt ${job?.attemptsMade}):`, err.message);
  });

  let hasLoggedRedisWarning = false;
  workerInstance.on("error", (err) => {
    const msg = err?.message || "";
    if (msg && !msg.includes("ECONNREFUSED")) {
      console.error("[Worker] Worker error:", msg);
    } else if (!hasLoggedRedisWarning) {
      hasLoggedRedisWarning = true;
      console.warn("ℹ️  [Worker] Redis unavailable in local dev — running in PostgreSQL direct fallback mode.");
    }
  });

  console.log("✅ Persistence worker started.");
  return workerInstance;
}

/**
 * Gracefully stops the worker, allowing in-flight jobs to complete.
 */
export async function stopPersistenceWorker() {
  if (workerInstance) {
    await workerInstance.close();
    workerInstance = null;
    console.log("Persistence worker stopped.");
  }
}

// ─── Standalone process entry point ──────────────────────────────────────────
// If run directly (not imported), start the worker.

const isMain = process.argv[1]?.endsWith("persistence.worker.js");
if (isMain) {
  startPersistenceWorker();

  process.on("SIGTERM", async () => {
    console.log("Worker received SIGTERM — shutting down gracefully...");
    await stopPersistenceWorker();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    console.log("Worker received SIGINT — shutting down gracefully...");
    await stopPersistenceWorker();
    process.exit(0);
  });
}
