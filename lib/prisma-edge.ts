import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

export const prisma = new PrismaClient({
  // Reads prisma+postgres://... from `.env` locally and from Vercel envs in prod
  datasourceUrl: process.env.DATABASE_URL
}).$extends(withAccelerate())
