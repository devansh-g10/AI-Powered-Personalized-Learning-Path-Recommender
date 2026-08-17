import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

/**
 * Prisma v7 requires a driver adapter instead of the datasourceUrl constructor option.
 * PrismaPg uses the pg (node-postgres) driver with connection pooling via PgBouncer URL.
 *
 * - Runtime queries: DATABASE_URL (port 6543, PgBouncer enabled)
 * - CLI/migrations: DIRECT_URL (port 5432, configured in prisma.config.ts)
 */
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
