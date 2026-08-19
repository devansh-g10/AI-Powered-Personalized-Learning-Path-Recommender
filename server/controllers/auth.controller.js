import {
  registerUser,
  loginUser,
  getGoogleOAuthUrl,
  syncGoogleProfile,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../services/auth.service.js";

// ─── POST /api/auth/register ──────────────────────────────────────────────────

export const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Full name, email, and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const result = await registerUser({ fullName, email, password });
    return res.status(201).json({ message: "Account created successfully", ...result });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const result = await loginUser({ email, password });
    return res.status(200).json({ message: "Login successful", ...result });
  } catch (err) {
    return res.status(401).json({ message: err.message });
  }
};

// ─── GET /api/auth/google ─────────────────────────────────────────────────────
// Returns the Supabase-generated Google OAuth URL for the frontend to redirect to.

export const googleOAuth = async (req, res) => {
  try {
    const url = await getGoogleOAuthUrl();
    return res.status(200).json({ url });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ─── POST /api/auth/google/sync ───────────────────────────────────────────────
// Called by the frontend after Google OAuth completes and it has a valid token.
// Syncs the Google user's name/avatar into our Prisma profiles table.
// Requires: Authorization: Bearer <supabase_access_token>

export const googleSync = async (req, res) => {
  try {
    // req.user is already set by authMiddleware
    const user = await syncGoogleProfile(req.user);
    return res.status(200).json({ message: "Profile synced", user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ─── POST /api/auth/forgot-password ──────────────────────────────────────────

export const forgotPasswordHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    await forgotPassword({ email });

    // Always return success to prevent email enumeration attacks
    return res.status(200).json({
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to send reset email. Please try again." });
  }
};

// ─── POST /api/auth/reset-password ───────────────────────────────────────────
// Body: { accessToken, newPassword }
// accessToken = the Supabase token obtained after clicking the reset email link

export const resetPasswordHandler = async (req, res) => {
  try {
    const { accessToken, newPassword } = req.body;

    if (!accessToken || !newPassword) {
      return res.status(400).json({ message: "Access token and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    await resetPassword({ accessToken, newPassword });
    return res.status(200).json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// ─── POST /api/auth/change-password (requires JWT) ───────────────────────────

export const changePasswordHandler = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user.id; // Supabase user id from auth middleware

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    await changePassword({ userId, newPassword });
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};
