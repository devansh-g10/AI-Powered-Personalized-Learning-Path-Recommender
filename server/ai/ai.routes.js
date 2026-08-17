import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  createConversationHandler,
  getConversationsHandler,
  getConversationHandler,
  deleteConversationHandler,
  getMessagesHandler,
  sendMessageHandler,
  saveLearningContextHandler,
  getLearningContextHandler,
  generateRoadmapHandler,
  getRoadmapHandler,
  askTopicQuestionHandler,
} from "./ai.controller.js";

const router = Router();

// All AI routes require authentication
router.use(authMiddleware);

// ─── Conversation management ──────────────────────────────────────────────────
router.post("/conversations", createConversationHandler);
router.get("/conversations", getConversationsHandler);
router.get("/conversations/:conversationId", getConversationHandler);
router.delete("/conversations/:conversationId", deleteConversationHandler);

// ─── Messages ─────────────────────────────────────────────────────────────────
router.get("/conversations/:conversationId/messages", getMessagesHandler);
router.post("/conversations/:conversationId/messages", sendMessageHandler);

// ─── Learning context (questionnaire) ─────────────────────────────────────────
router.post("/conversations/:conversationId/context", saveLearningContextHandler);
router.get("/conversations/:conversationId/context", getLearningContextHandler);

// ─── Roadmap generation & retrieval ──────────────────────────────────────────
router.post("/conversations/:conversationId/roadmap", generateRoadmapHandler);
router.get("/conversations/:conversationId/roadmap", getRoadmapHandler);

// ─── Topic cross-questioning ──────────────────────────────────────────────────
router.post(
  "/conversations/:conversationId/topics/:topicId/questions",
  askTopicQuestionHandler
);

export default router;
