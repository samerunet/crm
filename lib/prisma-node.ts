import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
const g = globalThis as unknown as { prisma?: PrismaClient }
export const prisma = g.prisma ?? new PrismaClient().$extends(withAccelerate())
if (process.env.NODE_ENV !== 'production') g.prisma = prisma
