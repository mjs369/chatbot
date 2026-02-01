import { PrismaClient } from '@prisma/client'

// グローバル変数でPrismaClientをキャッシュ（開発時のホットリロード対策）
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
