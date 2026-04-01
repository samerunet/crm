import "server-only";

import { Resend } from "resend";

import { buildGuideDownloadUrl } from "@/lib/guide-delivery";
import { GUIDE_PRODUCT } from "@/lib/guide-product";

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
    `<p>The customer delivery email should be sent automatically after fulfillment.</p>`,
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

export async function sendGuideDeliveryEmail(args: {
  orderId: string;
  buyerEmail?: string | null;
  buyerName?: string | null;
  guideTitle?: string | null;
}) {
  const rawBuyerEmail = sanitize(args.buyerEmail);
  if (!rawBuyerEmail) {
    console.warn("Guide delivery email skipped: buyer email missing.");
    return { ok: false as const, skipped: true as const, reason: "missing_buyer_email" };
  }
  if (!RESEND_API_KEY) {
    console.warn("Guide delivery email skipped: RESEND_API_KEY not set.");
    return { ok: false as const, skipped: true as const, reason: "missing_api_key" };
  }

  const resend = new Resend(RESEND_API_KEY);
  const buyerName = escapeHtml(sanitize(args.buyerName) || "there");
  const guideTitle = escapeHtml(sanitize(args.guideTitle) || GUIDE_PRODUCT.title);
  const downloadUrl = buildGuideDownloadUrl({ orderId: args.orderId });

  const html = `
    <div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;line-height:1.6;color:#1b130f">
      <p>Hi ${buyerName},</p>
      <p>Thank you for purchasing <strong>${guideTitle}</strong>.</p>
      <p>Your guide is ready. Use the button below to download your PDF.</p>
      <p style="margin:24px 0">
        <a href="${downloadUrl}" style="display:inline-block;background:#6C3A22;color:#fff;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:600">
          Download your guide
        </a>
      </p>
      <p><strong>Important:</strong> this email download link stays active for 24 hours. Open it on the device where you want to keep the file and save the PDF immediately.</p>
      <p>Recommended steps:</p>
      <ol style="padding-left:18px">
        <li>Tap <strong>Download your guide</strong>.</li>
        <li>Wait for the PDF to finish downloading completely.</li>
        <li>Save it to Files, Downloads, iCloud Drive, Google Drive, or your desktop.</li>
        <li>Keep a backup copy for future access.</li>
      </ol>
      <p>If the button does not open, copy and paste this link into your browser:</p>
      <p><a href="${downloadUrl}">${downloadUrl}</a></p>
      <p>If the link expires before you save the file, reply to this email and we can resend it.</p>
      <p>Please do not forward this email if you want to keep the download private.</p>
      <p>Thank you,<br />Fari Makeup</p>
    </div>
  `;

  const result = await resend.emails.send({
    from: RESEND_FROM,
    to: [rawBuyerEmail],
    subject: `Your ${GUIDE_PRODUCT.shortTitle} is ready`,
    html,
  });

  if ("error" in result && result.error) {
    throw new Error(result.error.message || "Resend send failed");
  }

  return { ok: true as const, id: (result as any).data?.id ?? null, downloadUrl };
}
