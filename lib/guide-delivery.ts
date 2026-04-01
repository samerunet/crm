import "server-only";

import crypto from "node:crypto";
import path from "node:path";

import { prisma } from "@/lib/prisma";
import { GUIDE_PRODUCT } from "@/lib/guide-product";

const IS_PROD =
  process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
const APP_URL =
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  (IS_PROD ? "https://farimakeup.com" : "http://localhost:3000");
const DOWNLOAD_SECRET = process.env.STRIPE_SECRET_KEY || "dev-guide-download-secret";
const EMAIL_DOWNLOAD_LIFETIME_MS = 1000 * 60 * 60 * 24 * 30;
const SESSION_DOWNLOAD_LIFETIME_MS = 1000 * 60 * 20;

function hashDownloadToken(rawToken: string) {
  return crypto.createHmac("sha256", DOWNLOAD_SECRET).update(rawToken).digest("hex");
}

function signSessionDownload(sessionId: string, expiresAt: number) {
  return crypto
    .createHmac("sha256", DOWNLOAD_SECRET)
    .update(`${sessionId}.${expiresAt}`)
    .digest("hex");
}

export async function issueGuideDownloadToken(orderId: string) {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const guideDownloadTokenHash = hashDownloadToken(rawToken);
  const guideDownloadExpiresAt = new Date(Date.now() + EMAIL_DOWNLOAD_LIFETIME_MS);

  await prisma.order.update({
    where: { id: orderId },
    data: {
      guideDownloadTokenHash,
      guideDownloadExpiresAt,
      guideDownloadUsedAt: null,
    },
  });

  return { rawToken, guideDownloadExpiresAt };
}

export async function consumeGuideDownloadToken(rawToken: string) {
  const guideDownloadTokenHash = hashDownloadToken(rawToken);
  const order = await prisma.order.findFirst({
    where: {
      guideDownloadTokenHash,
      guideDownloadExpiresAt: { gt: new Date() },
      guideDownloadUsedAt: null,
      guide: { slug: GUIDE_PRODUCT.slug },
    },
  });

  if (!order) {
    return null;
  }

  const consumed = await prisma.order.updateMany({
    where: {
      id: order.id,
      guideDownloadTokenHash,
      guideDownloadUsedAt: null,
    },
    data: {
      guideDownloadUsedAt: new Date(),
      guideDownloadTokenHash: null,
      guideDownloadExpiresAt: null,
    },
  });

  if (consumed.count !== 1) {
    return null;
  }

  return order;
}

export function buildGuideDownloadUrl(rawToken: string) {
  return `${APP_URL}/api/guides/download?token=${encodeURIComponent(rawToken)}`;
}

export function buildGuideSessionDownloadUrl(sessionId: string) {
  const expiresAt = Date.now() + SESSION_DOWNLOAD_LIFETIME_MS;
  const sig = signSessionDownload(sessionId, expiresAt);
  return `${APP_URL}/api/guides/download/session?sessionId=${encodeURIComponent(sessionId)}&expires=${expiresAt}&sig=${sig}`;
}

export function verifyGuideSessionDownload(args: {
  expires: string | null;
  sessionId: string;
  sig: string | null;
}) {
  if (!args.sessionId || !args.expires || !args.sig) {
    return false;
  }

  const expiresAt = Number(args.expires);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return false;
  }

  const expectedSig = signSessionDownload(args.sessionId, expiresAt);
  if (args.sig.length !== expectedSig.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(args.sig), Buffer.from(expectedSig));
}

export function getSessionDownloadCutoff() {
  return new Date(Date.now() - SESSION_DOWNLOAD_LIFETIME_MS);
}

export function getGuidePdfAbsolutePath() {
  return path.join(process.cwd(), GUIDE_PRODUCT.pdfStoragePath);
}
