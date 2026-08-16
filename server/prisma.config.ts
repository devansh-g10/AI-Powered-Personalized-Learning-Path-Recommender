import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Use DIRECT_URL (port 5432, no pgbouncer) for CLI/migrations.
  // Runtime queries via PrismaClient use DATABASE_URL (pooler).
  datasource: {
    url: env("DIRECT_URL"),
  },
});
