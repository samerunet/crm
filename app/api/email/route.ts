import "server-only";
import dns from "node:dns";
dns.setDefaultResultOrder?.("ipv4first");

if (
  process.env.NODE_ENV !== "production" &&
  process.env.DEV_ALLOW_INSECURE_TLS === "1"
) {
  try {
    const undici = require("undici") as typeof import("undici");
    undici.setGlobalDispatcher(
      new undici.Agent({
        connect: {
          rejectUnauthorized: false,
        },
      }),
    );
  } catch (err) {
    console.warn("Failed to configure dev TLS override:", err);
  }
}

import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM = process.env.RESEND_FROM || "Acme <onboarding@resend.dev>";
const SITE_CONTACT_TO =
  process.env.SITE_CONTACT_TO || "delivered@resend.dev";

const resend = new Resend(RESEND_API_KEY);

type JsonInit = Parameters<typeof NextResponse.json>[1];

function maskKey(key?: string) {
  if (!key) return "(not set)";
  if (key.length < 8) return "(set)";
  return key.slice(0, 3) + "…" + key.slice(-4);
}

function ok(data: any, init?: number | JsonInit) {
  const initObj = typeof init === "number" ? { status: init } : init;
  return NextResponse.json({ ok: true, ...data }, initObj);
}
function fail(error: any, init?: number | JsonInit) {
  const initObj = typeof init === "number" ? { status: init } : init;
  const message =
    typeof error === "string" ? error : error?.message || String(error);
  return NextResponse.json({ ok: false, error: message }, initObj);
}

function sanitize(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function toStringValue(value: unknown) {
  if (value == null) return undefined;
  if (typeof value === "number" && !Number.isNaN(value)) {
    return String(value);
  }
  return sanitize(value);
}

function normalizeAddOns(addOns: unknown): string[] {
  if (!Array.isArray(addOns)) return [];
  return addOns
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (
        item &&
        typeof item === "object" &&
        "label" in item &&
        typeof (item as any).label === "string"
      ) {
        return (item as any).label.trim();
      }
      return "";
    })
    .filter((val) => val.length > 0);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode");

  if (mode === "env") {
    return ok({
      env: {
        RESEND_API_KEY: maskKey(RESEND_API_KEY),
        RESEND_FROM,
        SITE_CONTACT_TO,
        runtime: "nodejs",
      },
      hint:
        "Dev rules: FROM must be onboarding@resend.dev, TO must be your Resend account email or delivered@resend.dev.",
    });
  }

  if (mode === "test") {
    try {
      const { data, error } = await resend.emails.send({
        from: RESEND_FROM,
        to: [SITE_CONTACT_TO],
        subject: "Resend connectivity test",
        html: `<p>This is a Resend test from your local app.</p>`,
      });
      if (error) return fail(error.message || "Resend test failed", 500);
      return ok({ id: data?.id });
    } catch (err: any) {
      return fail(err?.message || "fetch failed", 500);
    }
  }

  return ok({
    env: {
      RESEND_API_KEY: maskKey(RESEND_API_KEY),
      RESEND_FROM,
      SITE_CONTACT_TO,
      runtime: "nodejs",
    },
    hint:
      "POST JSON: { name, email?, phone?, service?, date?, location?, partySize?, addOns?, notes? }. Optional `to` to override default.",
  });
}

export async function POST(req: Request) {
  if (!RESEND_API_KEY) {
    return fail("RESEND_API_KEY is not set", 500);
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      to,
      name,
      email,
      phone,
      service,
      date,
      location,
      partySize,
      addOns,
      notes,
      message,
    } = body || {};

    const normalizedName = sanitize(name) ?? sanitize(body?.firstName);
    if (!normalizedName) return fail("Name is required", 400);

    const emailAddr = sanitize(email);
    const phoneNumber = sanitize(phone);
    const serviceTitle =
      sanitize(service) ??
      sanitize((body as any)?.serviceTitle) ??
      sanitize((body as any)?.topic);
    const preferredDate =
      sanitize(date) ?? sanitize((body as any)?.preferredDate);
    const locationText = sanitize(location);
    const partySizeText = toStringValue(partySize);
    const addOnsList = normalizeAddOns(addOns);
    const notesText = sanitize(notes);
    const messageText =
      sanitize(message) ?? sanitize((body as any)?.details) ?? undefined;

    const lines = [
      `<strong>New Booking Request</strong>`,
      "",
      `<strong>Name:</strong> ${normalizedName}`,
      emailAddr ? `<strong>Email:</strong> ${emailAddr}` : "",
      phoneNumber ? `<strong>Phone:</strong> ${phoneNumber}` : "",
      serviceTitle ? `<strong>Service:</strong> ${serviceTitle}` : "",
      preferredDate ? `<strong>Preferred Date:</strong> ${preferredDate}` : "",
      locationText ? `<strong>Location:</strong> ${locationText}` : "",
      partySizeText ? `<strong>Party Size:</strong> ${partySizeText}` : "",
      addOnsList.length
        ? `<strong>Add-ons:</strong> ${addOnsList.join(", ")}`
        : "",
      notesText ? `<strong>Notes:</strong> ${notesText}` : "",
      messageText
        ? `<hr /><pre style="white-space:pre-wrap">${messageText}</pre>`
        : "",
    ]
      .filter(Boolean)
      .join("<br/>");

    const toAddr = sanitize(to) || SITE_CONTACT_TO;

    const { data, error } = await resend.emails.send({
      from: RESEND_FROM,
      to: [toAddr],
      subject: `Booking Inquiry — ${normalizedName}`,
      html: `<div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto">
        ${lines}
      </div>`,
      ...(emailAddr ? { reply_to: emailAddr } : {}),
    });

    if (error) return fail(error.message || "Resend send failed", 502);

    return ok({ id: data?.id });
  } catch (err: any) {
    return fail(err?.message || "Unexpected error", 500);
  }
}
