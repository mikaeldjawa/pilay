import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Conservative pool size for serverless: each cold-started function
  // instance opens its own pool, so a large `max` here multiplies fast
  // under concurrent invocations. Node's pg default (10) is too generous
  // for that shape; the Neon connection string already points at Neon's
  // own pooler, so this only bounds connections from a single instance.
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, max: 5 });
  return new PrismaClient({ adapter, log: ["warn", "error"] });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
