import { Router } from "express";
import {
  register,
  login,
  googleOAuth,
  googleSync,
  forgotPasswordHandler,
  resetPasswordHandler,
  changePasswordHandler,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.get("/google", googleOAuth);                          // returns Google OAuth URL
router.post("/forgot-password", forgotPasswordHandler);
router.post("/reset-password", resetPasswordHandler);       // uses Supabase token from email link

// Protected routes (require valid Supabase session token)
router.post("/google/sync", authMiddleware, googleSync);    // sync Google profile to DB after OAuth
router.post("/change-password", authMiddleware, changePasswordHandler);

export default router;
