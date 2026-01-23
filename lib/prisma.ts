// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"; // use your DB adapter here

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!, // your DB URL
});

declare global {
  // avoid creating multiple clients in dev
  // @ts-ignore
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
