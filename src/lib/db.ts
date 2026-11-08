import { PrismaClient } from '@prisma/client'

const DEFAULT_POSTGRES_URL =
  'postgresql://neondb_owner:npg_6FzyImwUMh8i@ep-dry-base-b3f42qt9.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&schema=igasud'

if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:')) {
  process.env.DATABASE_URL = DEFAULT_POSTGRES_URL
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || DEFAULT_POSTGRES_URL,
    log: ['warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
