// app/api/email/route.ts
import 'server-only';
import dns from 'node:dns';
dns.setDefaultResultOrder?.('ipv4first');

// Optional dev TLS override (keep your original behavior)
if (process.env.NODE_ENV !== 'production' && process.env.DEV_ALLOW_INSECURE_TLS === '1') {
  try {
    const undici = require('undici') as typeof import('undici');
    undici.setGlobalDispatcher(
      new undici.Agent({
        connect: { rejectUnauthorized: false },
      }),
    );
  } catch (err) {
    console.warn('Failed to configure dev TLS override:', err);
  }
}

import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';
// Prevent any caching of API results
export const dynamic = 'force-dynamic';

const IS_PROD = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production';

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

// In prod we must use a verified sender (your domain). In dev we keep Resend's onboarding.
const RESEND_FROM = IS_PROD
  ? process.env.RESEND_FROM || 'Fari Makeup <hello@farimakeup.com>'
  : process.env.RESEND_FROM || 'Acme <onboarding@resend.dev>';

// In prod, lock delivery to this inbox. In dev we still default to delivered@resend.dev.
const SITE_CONTACT_TO =
  process.env.SITE_CONTACT_TO || (IS_PROD ? 'bookings@farimakeup.com' : 'delivered@resend.dev');

const resend = new Resend(RESEND_API_KEY);

type JsonInit = Parameters<typeof NextResponse.json>[1];
const ok = (data: any, init?: number | JsonInit) =>
  NextResponse.json({ ok: true, ...data }, typeof init === 'number' ? { status: init } : init);
const fail = (error: any, init?: number | JsonInit) => {
  const msg = typeof error === 'string' ? error : error?.message || String(error);
  return NextResponse.json(
    { ok: false, error: msg },
    typeof init === 'number' ? { status: init } : init,
  );
};

function maskKey(key?: string) {
  if (!key) return '(not set)';
  if (key.length < 8) return '(set)';
  return key.slice(0, 3) + '…' + key.slice(-4);
}

function sanitize(value: unknown) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}
function toStringValue(value: unknown) {
  if (value == null) return undefined;
  if (typeof value === 'number' && !Number.isNaN(value)) return String(value);
  return sanitize(value);
}
function normalizeAddOns(addOns: unknown): string[] {
  if (!Array.isArray(addOns)) return [];
  return addOns
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (
        item &&
        typeof item === 'object' &&
        'label' in item &&
        typeof (item as any).label === 'string'
      )
        return (item as any).label.trim();
      return '';
    })
    .filter(Boolean);
}

// Extract plain email from "Name <email@domain>" or "email@domain"
function extractEmail(address: string): string | undefined {
  const s = address.trim();
  const m = s.match(/<([^>]+)>/);
  return (m?.[1] || s).toLowerCase();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('mode');

  if (mode === 'env') {
    return ok({
      env: {
        prod: IS_PROD,
        RESEND_API_KEY: maskKey(RESEND_API_KEY),
        RESEND_FROM,
        SITE_CONTACT_TO,
        runtime: 'nodejs',
      },
      hint: IS_PROD
        ? 'Production: FROM must be a verified @farimakeup.com sender and will be enforced.'
        : 'Development: FROM can be onboarding@resend.dev; TO defaults to delivered@resend.dev.',
    });
  }

  if (mode === 'test') {
    if (!RESEND_API_KEY) return fail('RESEND_API_KEY is not set', 500);

    // In prod, enforce verified FROM domain
    if (IS_PROD) {
      const fromEmail = extractEmail(RESEND_FROM);
      if (!fromEmail || !fromEmail.endsWith('@farimakeup.com')) {
        return fail(
          'RESEND_FROM must be an @farimakeup.com address in production (verified in Resend).',
          500,
        );
      }
    }

    try {
      const { data, error } = await resend.emails.send({
        from: RESEND_FROM,
        to: [SITE_CONTACT_TO],
        subject: IS_PROD ? 'Fari Makeup — Production email test' : 'Resend Dev test',
        html: `<p>This is a ${IS_PROD ? 'Production' : 'Dev'} test email from your app.</p>`,
      });
      if (error)
        return fail(`${error.name || 'ResendError'}: ${error.message || 'send failed'}`, 502);
      return ok({ id: data?.id });
    } catch (err: any) {
      return fail(err?.message || 'Unexpected error', 500);
    }
  }

  return ok({
    message:
      'POST JSON: { name, email?, phone?, service?, date?, location?, partySize?, addOns?, notes?, message? }',
  });
}

export async function POST(req: Request) {
  if (!RESEND_API_KEY) return fail('RESEND_API_KEY is not set', 500);

  // Enforce verified from domain in production
  if (IS_PROD) {
    const fromEmail = extractEmail(RESEND_FROM);
    if (!fromEmail || !fromEmail.endsWith('@farimakeup.com')) {
      return fail(
        'RESEND_FROM must be an @farimakeup.com address in production (verified in Resend).',
        500,
      );
    }
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { to, name, email, phone, service, date, location, partySize, addOns, notes, message } =
      body || {};

    const normalizedName = sanitize(name) ?? sanitize((body as any)?.firstName);
    if (!normalizedName) return fail('Name is required', 400);

    const emailAddr = sanitize(email);
    const phoneNumber = sanitize(phone);
    const serviceTitle =
      sanitize(service) ?? sanitize((body as any)?.serviceTitle) ?? sanitize((body as any)?.topic);
    const preferredDate = sanitize(date) ?? sanitize((body as any)?.preferredDate);
    const locationText = sanitize(location);
    const partySizeText = toStringValue(partySize);
    const addOnsList = normalizeAddOns(addOns);
    const notesText = sanitize(notes);
    const messageText = sanitize(message) ?? sanitize((body as any)?.details) ?? undefined;

    const lines = [
      `<strong>New Booking Request</strong>`,
      `<strong>Name:</strong> ${normalizedName}`,
      emailAddr ? `<strong>Email:</strong> ${emailAddr}` : '',
      phoneNumber ? `<strong>Phone:</strong> ${phoneNumber}` : '',
      serviceTitle ? `<strong>Service:</strong> ${serviceTitle}` : '',
      preferredDate ? `<strong>Preferred Date:</strong> ${preferredDate}` : '',
      locationText ? `<strong>Location:</strong> ${locationText}` : '',
      partySizeText ? `<strong>Party Size:</strong> ${partySizeText}` : '',
      addOnsList.length ? `<strong>Add-ons:</strong> ${addOnsList.join(', ')}` : '',
      notesText ? `<strong>Notes:</strong> ${notesText}` : '',
      messageText ? `<hr /><pre style="white-space:pre-wrap">${messageText}</pre>` : '',
    ]
      .filter(Boolean)
      .join('<br/>');

    // In prod, ignore client 'to' and always use your configured inbox
    const toAddr = IS_PROD ? SITE_CONTACT_TO : sanitize(to) || SITE_CONTACT_TO;

    const { data, error } = await resend.emails.send({
      from: RESEND_FROM,
      to: [toAddr],
      subject: `Booking Inquiry — ${normalizedName}`,
      html: `<div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto">${lines}</div>`,
      ...(emailAddr ? { reply_to: emailAddr } : {}),
    });

    if (error)
      return fail(`${error.name || 'ResendError'}: ${error.message || 'send failed'}`, 502);
    return ok({ id: data?.id });
  } catch (err: any) {
    return fail(err?.message || 'Unexpected error', 500);
  }
}
