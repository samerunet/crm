export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-node'

export async function POST() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public."User" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT,
        "email" TEXT UNIQUE,
        "emailVerified" TIMESTAMP,
        "image" TEXT,
        "passwordHash" TEXT,
        "role" TEXT NOT NULL DEFAULT 'USER',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS public."Lead" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT,
        "email" TEXT,
        "phone" TEXT,
        "eventDate" TIMESTAMP,
        "message" TEXT,
        "source" TEXT DEFAULT 'homepage',
        "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 })
  }
}
