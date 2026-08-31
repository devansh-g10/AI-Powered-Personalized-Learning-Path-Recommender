import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import aiRoutes from "./ai/ai.routes.js";
import { closeRedis } from "./configs/redis.js";
import { closePersistenceQueue } from "./configs/bullmq.js";
import { startPersistenceWorker, stopPersistenceWorker } from "./workers/persistence.worker.js";

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://ai-powered-personalized-learning-pa-lilac.vercel.app",
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin requests)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        allowedOrigins.some((allowed) => origin.startsWith(allowed)) ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      // In production, also allow vercel / netlify preview deployments if needed
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Server is healthy ❤️");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/ai", aiRoutes);

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  // Start the BullMQ persistence worker (embedded mode)
  startPersistenceWorker();
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
async function shutdown(signal) {
  console.log(`\nReceived ${signal} — shutting down gracefully...`);

  // Stop accepting new connections
  server.close(async () => {
    try {
      await stopPersistenceWorker();
      await closePersistenceQueue();
      await closeRedis();
      console.log("✅ Graceful shutdown complete.");
      process.exit(0);
    } catch (err) {
      console.error("Shutdown error:", err.message);
      process.exit(1);
    }
  });

  // Force exit after 15 seconds if graceful shutdown hangs
  setTimeout(() => {
    console.error("Forced exit after timeout.");
    process.exit(1);
  }, 15000);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));