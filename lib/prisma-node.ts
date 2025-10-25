import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const g = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const base = new PrismaClient();
  const accelerateEnabled =
    process.env.NODE_ENV === "production" &&
    (process.env.DATABASE_URL?.startsWith("prisma://") ||
      process.env.DATABASE_URL?.startsWith("prisma+postgres://") ||
      !!process.env.PRISMA_ACCELERATE_URL);
  return accelerateEnabled ? base.$extends(withAccelerate()) : base;
}

export const prisma = g.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") g.prisma = prisma;
