export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-node';

const toIso = (value: unknown) => {
  if (typeof value !== 'string') return undefined;
  const dt = new Date(value);
  return Number.isNaN(dt.getTime()) ? undefined : dt.toISOString();
};

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ ok: true, leads });
  } catch (e: any) {
    console.error('GET /api/leads failed', e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Failed to fetch leads' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const name = typeof payload?.name === 'string' ? payload.name.trim().slice(0, 255) : null;
    const emailRaw = typeof payload?.email === 'string' ? payload.email.trim() : '';
    const email = emailRaw || 'no-email@placeholder.invalid';
    const phone =
      typeof payload?.phone === 'string' ? payload.phone.trim().slice(0, 100) || null : null;
    const message =
      typeof payload?.message === 'string' ? payload.message.trim().slice(0, 5000) || null : null;
    const source =
      typeof payload?.source === 'string' ? payload.source.trim().slice(0, 150) || null : null;
    const eventDateValue = payload?.eventDate || payload?.date || payload?.dateOfService;
    const eventDateIso = toIso(eventDateValue);
    const eventDate = eventDateIso ? new Date(eventDateIso) : undefined;

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        message,
        source,
        eventDate,
      },
    });
    return NextResponse.json({ ok: true, lead }, { status: 201 });
  } catch (e: any) {
    console.error('POST /api/leads failed', e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Failed to create lead' },
      { status: 500 },
    );
  }
}
