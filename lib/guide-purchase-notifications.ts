import "server-only";

import { Resend } from "resend";

const IS_PROD =
  process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM =
  process.env.RESEND_FROM ||
  (IS_PROD ? "Fari Makeup <booking@farimakeup.com>" : "Acme <onboarding@resend.dev>");
const NOTIFICATION_TO =
  process.env.SITE_CONTACT_TO ||
  (IS_PROD ? "bookings@farimakeup.com" : "delivered@resend.dev");

function formatAmount(amountCents: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amountCents / 100);
  } catch {
    return `${(amountCents / 100).toFixed(2)} ${currency.toUpperCase()}`;
  }
}

function sanitize(value: string | null | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendGuidePurchaseNotification(args: {
  buyerEmail?: string | null;
  buyerName?: string | null;
  guideTitle?: string | null;
  amountCents: number;
  currency: string;
  sessionId: string;
}) {
  if (!RESEND_API_KEY) {
    console.warn("Guide purchase notification skipped: RESEND_API_KEY not set.");
    return { ok: false as const, skipped: true as const, reason: "missing_api_key" };
  }

  const resend = new Resend(RESEND_API_KEY);
  const buyerEmail = escapeHtml(sanitize(args.buyerEmail) || "not provided");
  const buyerName = escapeHtml(sanitize(args.buyerName) || "Not provided");
  const guideTitle = escapeHtml(sanitize(args.guideTitle) || "Makeup Guide");
  const formattedAmount = formatAmount(args.amountCents, args.currency);

  const html = [
    `<p>A guide purchase was completed.</p>`,
    `<p><strong>Guide:</strong> ${guideTitle}</p>`,
    `<p><strong>Buyer name:</strong> ${buyerName}</p>`,
    `<p><strong>Buyer email:</strong> ${buyerEmail}</p>`,
    `<p><strong>Amount:</strong> ${formattedAmount}</p>`,
    `<p><strong>Stripe session:</strong> ${args.sessionId}</p>`,
    `<p>Email the PDF guide to this buyer if delivery is manual.</p>`,
  ].join("");

  const result = await resend.emails.send({
    from: RESEND_FROM,
    to: [NOTIFICATION_TO],
    subject: `Guide Purchase — ${guideTitle}`,
    html: `<div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">${html}</div>`,
    ...(buyerEmail !== "not provided" ? { replyTo: buyerEmail } : {}),
  });

  if ("error" in result && result.error) {
    throw new Error(result.error.message || "Resend send failed");
  }

  return { ok: true as const, id: (result as any).data?.id ?? null };
}
