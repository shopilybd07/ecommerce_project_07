import { PrismaClient } from '@/generated/prisma'

const globalForPrisma = global as unknown as {
  prisma: PrismaClient
}

// Mock Prisma client for non-production environments
const prisma =
  process.env.NODE_ENV !== 'production'
    ? ({
        chatRoom: {
          findUnique: () => Promise.resolve(null),
          create: (data: any) => Promise.resolve({ id: 'mock-room-id', ...data.data }),
        },
        chatMessage: {
          create: (data: any) => Promise.resolve({ id: 'mock-message-id', ...data.data }),
          findMany: () => Promise.resolve([]),
          count: () => Promise.resolve(0),
        },
        user: {
          findFirst: () => Promise.resolve({ id: 'admin-id' }),
        },
      } as unknown as PrismaClient)
    : (globalForPrisma.prisma || new PrismaClient())

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma