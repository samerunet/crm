export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-edge'

export async function GET() {
  try {
    const count = await prisma.lead.count().catch(() => -1)
    return NextResponse.json({ ok: true, leadCount: count })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'Unknown error' }, { status: 500 })
  }
}
