export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-node';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as any));
  const email = body.email || 'admin@farimakeup.com';
  const name = body.name || 'Admin';
  const now = new Date();
  const user = await prisma.user.upsert({
    where: { email },
    update: { role: 'admin', name, updatedAt: now },
    create: { email, name, role: 'admin', createdAt: now, updatedAt: now }
  });
  return NextResponse.json({ ok: true, user });
}
