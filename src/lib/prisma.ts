import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

// Prisma 7 better-sqlite3 adapter expects the URL in the configuration object
const dbPath = process.env.DATABASE_URL || 'file:./prisma/dev.db'
const adapter = new PrismaBetterSqlite3({ url: dbPath })

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
