export const runtime = 'edge'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-edge'

// Minimal example; add validation as needed later
export async function POST(req: Request) {
  try {
    const data = await req.json()
    const lead = await prisma.lead.create({ data })
    return NextResponse.json({ ok: true, lead }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Unknown error' }, { status: 500 })
  }
}
