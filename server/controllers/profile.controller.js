import { getUserProfile } from "../services/profile.service.js";

// ─── GET /api/profile/me ──────────────────────────────────────────────────────

export const getMyProfile = async (req, res) => {
  try {
    // req.user is the full Supabase user object set by authMiddleware
    const profile = await getUserProfile(req.user);
    return res.status(200).json({ profile });
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
};
