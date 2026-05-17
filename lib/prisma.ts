import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    transactionOptions: {
      timeout: 15000, // 15 seconds - increased for Supabase free tier variability
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
