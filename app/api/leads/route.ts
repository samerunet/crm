export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-node';

type LeadRecord = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  eventDate: Date | null;
  message: string | null;
  source: string | null;
  createdAt: Date;
};

const EMAIL_PLACEHOLDER = 'no-email@placeholder.invalid';

const toIso = (value: unknown) => {
  if (typeof value !== 'string') return undefined;
  const dt = new Date(value);
  return Number.isNaN(dt.getTime()) ? undefined : dt.toISOString();
};

const useDemoStore = !process.env.DATABASE_URL && process.env.NODE_ENV !== 'production';

const demoNow = Date.now();
const demoLeads: LeadRecord[] = [
  {
    id: 'demo-lead-1',
    name: 'Alice Park',
    email: 'alice@example.com',
    phone: '555-201',
    eventDate: new Date(demoNow),
    message: 'Looking for soft glam for wedding morning.',
    source: 'demo',
    createdAt: new Date(demoNow),
  },
  {
    id: 'demo-lead-2',
    name: 'Brianna Chen',
    email: 'bri@example.com',
    phone: '555-202',
    eventDate: new Date(demoNow + 3 * 24 * 60 * 60 * 1000),
    message: 'Bridal party of 6 — need onsite team.',
    source: 'demo',
    createdAt: new Date(demoNow - 4 * 60 * 60 * 1000),
  },
  {
    id: 'demo-lead-3',
    name: 'Cami Diaz',
    email: 'cami@example.com',
    phone: '555-203',
    eventDate: new Date(demoNow - 10 * 24 * 60 * 60 * 1000),
    message: 'Post-wedding photoshoot touch-up.',
    source: 'demo',
    createdAt: new Date(demoNow - 2 * 24 * 60 * 60 * 1000),
  },
];

export async function GET() {
  if (useDemoStore) {
    console.warn('GET /api/leads using in-memory demo data (DATABASE_URL not set).');
    return NextResponse.json({ ok: true, leads: demoLeads });
  }

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
  if (useDemoStore) {
    try {
      const payload = await req.json();
      const name = typeof payload?.name === 'string' ? payload.name.trim().slice(0, 255) : null;
      const emailRaw = typeof payload?.email === 'string' ? payload.email.trim() : '';
      const email = emailRaw || EMAIL_PLACEHOLDER;
      const phone =
        typeof payload?.phone === 'string' ? payload.phone.trim().slice(0, 100) || null : null;
      const message =
        typeof payload?.message === 'string' ? payload.message.trim().slice(0, 5000) || null : null;
      const source =
        typeof payload?.source === 'string' ? payload.source.trim().slice(0, 150) || null : null;
      const eventDateValue = payload?.eventDate || payload?.date || payload?.dateOfService;
      const eventDateIso = toIso(eventDateValue);
      const eventDate = eventDateIso ? new Date(eventDateIso) : null;

      const lead: LeadRecord = {
        id: `demo-lead-${Date.now()}`,
        name,
        email,
        phone,
        message,
        source,
        eventDate,
        createdAt: new Date(),
      };
      demoLeads.unshift(lead);
      console.warn('POST /api/leads stored lead in demo memory store (DATABASE_URL not set).');
      return NextResponse.json({ ok: true, lead }, { status: 201 });
    } catch (e: any) {
      console.error('POST /api/leads demo mode failed', e);
      return NextResponse.json(
        { ok: false, error: e?.message ?? 'Failed to create lead' },
        { status: 500 },
      );
    }
  }

  try {
    const payload = await req.json();
    const name = typeof payload?.name === 'string' ? payload.name.trim().slice(0, 255) : null;
    const emailRaw = typeof payload?.email === 'string' ? payload.email.trim() : '';
    const email = emailRaw || EMAIL_PLACEHOLDER;
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

export async function PATCH(req: Request) {
  if (useDemoStore) {
    try {
      const payload = await req.json();
      const id = typeof payload?.id === 'string' ? payload.id : null;
      if (!id) {
        return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });
      }
      const idx = demoLeads.findIndex((lead) => lead.id === id);
      if (idx === -1) {
        return NextResponse.json({ ok: false, error: 'Lead not found' }, { status: 404 });
      }
      const name =
        typeof payload?.name === 'string' ? payload.name.trim().slice(0, 255) || null : null;
      const emailRaw = typeof payload?.email === 'string' ? payload.email.trim() : '';
      const email = emailRaw || EMAIL_PLACEHOLDER;
      const phone =
        typeof payload?.phone === 'string' ? payload.phone.trim().slice(0, 100) || null : null;
      const message =
        typeof payload?.message === 'string' ? payload.message.slice(0, 10000) || null : null;
      const source =
        typeof payload?.source === 'string' ? payload.source.trim().slice(0, 150) || null : null;
      const eventDateIso = toIso(payload?.eventDate);
      let eventDate = demoLeads[idx].eventDate;
      if (eventDateIso) {
        eventDate = new Date(eventDateIso);
      } else if (payload?.eventDate === null) {
        eventDate = null;
      }

      const updated: LeadRecord = {
        ...demoLeads[idx],
        name,
        email,
        phone,
        message,
        source,
        eventDate,
      };
      demoLeads[idx] = updated;
      return NextResponse.json({ ok: true, lead: updated });
    } catch (e: any) {
      console.error('PATCH /api/leads demo mode failed', e);
      return NextResponse.json(
        { ok: false, error: e?.message ?? 'Failed to update lead' },
        { status: 500 },
      );
    }
  }

  try {
    const payload = await req.json();
    const id = typeof payload?.id === 'string' ? payload.id : null;
    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });
    }
    const name =
      typeof payload?.name === 'string' ? payload.name.trim().slice(0, 255) || null : null;
    const emailRaw = typeof payload?.email === 'string' ? payload.email.trim() : '';
    const email = emailRaw || EMAIL_PLACEHOLDER;
    const phone =
      typeof payload?.phone === 'string' ? payload.phone.trim().slice(0, 100) || null : null;
    const message =
      typeof payload?.message === 'string' ? payload.message.slice(0, 10000) || null : null;
    const source =
      typeof payload?.source === 'string' ? payload.source.trim().slice(0, 150) || null : null;
    const eventDateIso = toIso(payload?.eventDate);

    const data: Record<string, unknown> = {
      name,
      email,
      phone,
      message,
      source,
    };
    if (eventDateIso) {
      data.eventDate = new Date(eventDateIso);
    } else if (payload?.eventDate === null) {
      data.eventDate = null;
    }

    const lead = await prisma.lead.update({
      where: { id },
      data,
    });

    return NextResponse.json({ ok: true, lead });
  } catch (e: any) {
    console.error('PATCH /api/leads failed', e);
    return NextResponse.json(
      { ok: false, error: e?.message ?? 'Failed to update lead' },
      { status: 500 },
    );
  }
}
