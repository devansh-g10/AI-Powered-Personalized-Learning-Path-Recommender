import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";

const app = express();
const PORT = process.env.PORT || 4000;
const allowedOrigins = ["http://localhost:5173"];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("Server is healthy ❤️");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});