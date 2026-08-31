import { supabase } from "../configs/supabase.config.js";

/**
 * Middleware to verify a Supabase JWT Bearer token.
 * Attaches the Supabase user object to req.user on success.
 */
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  // 1. Support demo / guest sessions seamlessly
  if (
    token.startsWith("demo-") ||
    token === "demo-jwt-token" ||
    token.startsWith("token-")
  ) {
    req.user = {
      id: "demo-user-101",
      email: "learner@pathai.dev",
      app_metadata: { provider: "email" },
      user_metadata: { fullName: "Alex Rivera" },
    };
    return next();
  }

  // 2. Verify Supabase JWT token
  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
    }

    // Attach Supabase user — contains id, email, user_metadata, etc.
    req.user = data.user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};

export default authMiddleware;
