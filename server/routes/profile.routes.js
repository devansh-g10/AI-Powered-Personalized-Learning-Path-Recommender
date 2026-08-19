import { Router } from "express";
import { getMyProfile } from "../controllers/profile.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

// All profile routes require authentication
router.get("/me", authMiddleware, getMyProfile);

export default router;
