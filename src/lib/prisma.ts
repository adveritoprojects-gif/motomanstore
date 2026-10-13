import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Options for interactive transactions. The Prisma default (5s) is too tight
 * for the remote Postgres pooler — checkout transactions measure 3–8s here —
 * so order placement and payment reconciliation get a larger budget.
 */
export const TX_OPTIONS = { maxWait: 10_000, timeout: 20_000 } as const;
