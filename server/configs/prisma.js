import "dotenv/config";
import { PrismaClient } from "../generated/prisma/index.js";

// Use the pgbouncer pooler URL at runtime for efficient connection management.
// Migrations use DIRECT_URL (configured in prisma.config.ts).
const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

export default prisma;
