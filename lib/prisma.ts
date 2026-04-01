// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Важно: используйте одну инстанцию PrismaClient в serverless среде
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL, // для Prisma 7+
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
