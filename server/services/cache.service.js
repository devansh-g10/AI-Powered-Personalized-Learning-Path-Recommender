import getRedisClient from "../configs/redis.js";

// ─── Key builders ─────────────────────────────────────────────────────────────

const keys = {
  conversationMeta: (id) => `conv:${id}:meta`,
  messages: (id) => `conv:${id}:messages`,
  roadmap: (id) => `conv:${id}:roadmap`,
  context: (id) => `conv:${id}:context`,
};

// ─── TTL constants (seconds) ──────────────────────────────────────────────────
const TTL = {
  CONVERSATION_META: 3600,      // 1 hour
  MESSAGES: 1800,               // 30 minutes
  ROADMAP: 7200,                // 2 hours
  LEARNING_CONTEXT: 86400,      // 24 hours
};

// ─── Safe Redis wrapper ───────────────────────────────────────────────────────
/**
 * Wraps Redis operations so failures are non-fatal.
 * App continues with PostgreSQL as fallback.
 */
async function safeRedis(operation) {
  try {
    const redis = getRedisClient();
    return await operation(redis);
  } catch (err) {
    console.warn("⚠️  Redis cache miss (falling back to DB):", err.message);
    return null;
  }
}

// ─── Conversation metadata ────────────────────────────────────────────────────

export async function getCachedConversation(conversationId) {
  return safeRedis(async (redis) => {
    const data = await redis.get(keys.conversationMeta(conversationId));
    return data ? JSON.parse(data) : null;
  });
}

export async function setCachedConversation(conversationId, data) {
  return safeRedis(async (redis) => {
    await redis.setex(
      keys.conversationMeta(conversationId),
      TTL.CONVERSATION_META,
      JSON.stringify(data)
    );
  });
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function getCachedMessages(conversationId) {
  return safeRedis(async (redis) => {
    const data = await redis.get(keys.messages(conversationId));
    return data ? JSON.parse(data) : null;
  });
}

export async function setCachedMessages(conversationId, messages) {
  return safeRedis(async (redis) => {
    // Keep only the last 100 messages in cache for performance
    const messagesToCache = messages.slice(-100);
    await redis.setex(
      keys.messages(conversationId),
      TTL.MESSAGES,
      JSON.stringify(messagesToCache)
    );
  });
}

export async function appendMessageToCache(conversationId, humanMsg, aiMsg) {
  return safeRedis(async (redis) => {
    const existing = await redis.get(keys.messages(conversationId));
    const messages = existing ? JSON.parse(existing) : [];
    messages.push(humanMsg, aiMsg);
    // Keep last 100
    const trimmed = messages.slice(-100);
    await redis.setex(
      keys.messages(conversationId),
      TTL.MESSAGES,
      JSON.stringify(trimmed)
    );
  });
}

// ─── Roadmap ──────────────────────────────────────────────────────────────────

export async function getCachedRoadmap(conversationId) {
  return safeRedis(async (redis) => {
    const data = await redis.get(keys.roadmap(conversationId));
    return data ? JSON.parse(data) : null;
  });
}

export async function setCachedRoadmap(conversationId, roadmapJson) {
  return safeRedis(async (redis) => {
    await redis.setex(
      keys.roadmap(conversationId),
      TTL.ROADMAP,
      JSON.stringify(roadmapJson)
    );
  });
}

// ─── Learning context ─────────────────────────────────────────────────────────

export async function getCachedLearningContext(conversationId) {
  return safeRedis(async (redis) => {
    const data = await redis.get(keys.context(conversationId));
    return data ? JSON.parse(data) : null;
  });
}

export async function setCachedLearningContext(conversationId, contextData) {
  return safeRedis(async (redis) => {
    await redis.setex(
      keys.context(conversationId),
      TTL.LEARNING_CONTEXT,
      JSON.stringify(contextData)
    );
  });
}

// ─── Cache invalidation ───────────────────────────────────────────────────────

/**
 * Invalidates all cache keys for a conversation.
 * Called on conversation deletion.
 */
export async function invalidateConversationCache(conversationId) {
  return safeRedis(async (redis) => {
    await redis.del(
      keys.conversationMeta(conversationId),
      keys.messages(conversationId),
      keys.roadmap(conversationId),
      keys.context(conversationId)
    );
  });
}
