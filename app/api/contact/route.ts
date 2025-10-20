export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-node';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('mode');

  if (mode === 'env') {
    return NextResponse.json({
      ok: true,
      env: {
        nodeEnv: process.env.NODE_ENV ?? null,
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
        vercelEnv: process.env.VERCEL_ENV ?? null,
      },
    });
  }

  return NextResponse.json({ ok: true, route: 'contact' });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, topic, message } = body ?? {};
    if (!name && !email && !message) {
      return NextResponse.json({ ok: false, error: 'missing fields' }, { status: 400 });
    }
    const now = new Date();
    const lead = await prisma.lead.create({
      data: {
        name: name ?? null,
        email: email ?? null,
        message: message ?? null,
        source: (topic ?? 'contact') as string,
        createdAt: now,
        updatedAt: now,
      },
      select: { id: true, name: true, email: true, message: true, source: true, createdAt: true },
    });
    return NextResponse.json({ ok: true, lead }, { status: 201, headers: { 'Access-Control-Allow-Origin': '*' } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? 'invalid' }, { status: 400 });
  }
}
