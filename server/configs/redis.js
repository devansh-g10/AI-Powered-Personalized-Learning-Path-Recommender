import "dotenv/config";
import Redis from "ioredis";

let redis;

/**
 * Returns a singleton ioredis client for general cache operations (get/set).
 * maxRetriesPerRequest: 3 — safe for non-blocking Redis commands.
 *
 * Fails gracefully — if Redis is unavailable, the app continues
 * with PostgreSQL as the fallback source of truth.
 */
export function getRedisClient() {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: true,
      reconnectOnError(err) {
        const targetErrors = ["READONLY", "ECONNRESET", "ETIMEDOUT"];
        return targetErrors.some((e) => err.message.includes(e));
      },
    });

    redis.on("connect", () => console.log("✅ Redis connected"));
    redis.on("error", (err) => console.error("⚠️  Redis error (non-fatal):", err.message));
    redis.on("close", () => console.warn("⚠️  Redis connection closed"));
  }
  return redis;
}

/**
 * Creates a new ioredis connection specifically for BullMQ's Worker.
 * BullMQ requires maxRetriesPerRequest: null for blocking commands (BLPOP, etc.).
 * This must be a SEPARATE connection instance from the shared Redis client.
 */
export function createBullMQConnection() {
  const conn = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: null, // Required by BullMQ for blocking commands
    enableReadyCheck: false,
    lazyConnect: false,
  });
  conn.on("error", (err) => {
    // Suppress uncaught error event when redis is unavailable
  });
  return conn;
}

/**
 * Gracefully close the shared Redis connection (called on server shutdown).
 */
export async function closeRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log("Redis connection closed.");
  }
}

export default getRedisClient;
