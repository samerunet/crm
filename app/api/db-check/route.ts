export const runtime = 'edge'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-edge'
export async function GET() {
  try {
    const [leadCount, userCount] = await Promise.all([prisma.lead.count(), prisma.user.count()])
    return NextResponse.json({ ok: true, leadCount, userCount })
  } catch (e:any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 })
  }
}
