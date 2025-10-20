export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-node';
export async function GET(req: Request) {
  try {
    const u = new URL(req.url);
    const b64 = u.searchParams.get('b64');
    if (!b64) return NextResponse.json({ ok: false, error: 'missing b64' }, { status: 400 });
    const sql = Buffer.from(b64, 'base64').toString('utf8');
    const res = await prisma.$executeRawUnsafe(sql);
    return NextResponse.json({ ok: true, count: Number(res) || 0 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
