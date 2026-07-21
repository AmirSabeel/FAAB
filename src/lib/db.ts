import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'

function getDatabaseUrl() {
  const root = process.cwd()
  const possiblePaths = [
    path.join(root, 'prisma', 'db', 'custom.db'),
    path.join(root, 'db', 'custom.db'),
    path.join(root, '.next', 'standalone', 'prisma', 'db', 'custom.db'),
  ]

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return `file:${p.replace(/\\/g, '/')}`
    }
  }

  const defaultPath = path.join(root, 'prisma', 'db', 'custom.db')
  return `file:${defaultPath.replace(/\\/g, '/')}`
}

const dbUrl = getDatabaseUrl()

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
