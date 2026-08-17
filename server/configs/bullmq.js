import "dotenv/config";
import { Queue } from "bullmq";
import getRedisClient from "./redis.js";

const PERSISTENCE_QUEUE = "persistence-queue";

let persistenceQueue;

/**
 * Returns a singleton BullMQ Queue for DB persistence jobs.
 */
export function getPersistenceQueue() {
  if (!persistenceQueue) {
    // Queue uses the shared Redis client (maxRetriesPerRequest:3 is fine for non-blocking ops)
    const connection = getRedisClient();
    persistenceQueue = new Queue(PERSISTENCE_QUEUE, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      },
    });

    persistenceQueue.on("error", (err) => {
      console.error("⚠️  BullMQ queue error:", err.message);
    });
  }
  return persistenceQueue;
}

/**
 * Gracefully closes the queue connection.
 */
export async function closePersistenceQueue() {
  if (persistenceQueue) {
    await persistenceQueue.close();
    persistenceQueue = null;
    console.log("BullMQ persistence queue closed.");
  }
}

export { PERSISTENCE_QUEUE };
