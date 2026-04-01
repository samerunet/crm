import "server-only";

import crypto from "node:crypto";
import path from "node:path";

import { GUIDE_PRODUCT } from "@/lib/guide-product";

const IS_PROD =
  process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
const APP_URL =
  process.env.APP_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  (IS_PROD ? "https://farimakeup.com" : "http://localhost:3000");
const DOWNLOAD_SECRET = process.env.STRIPE_SECRET_KEY || "dev-guide-download-secret";
type GuideDownloadTokenPayload = {
  orderId: string;
  slug: string;
};

function toBase64Url(input: string) {
  return Buffer.from(input, "utf8").toString("base64url");
}

function fromBase64Url(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function signPayload(encodedPayload: string) {
  return crypto.createHmac("sha256", DOWNLOAD_SECRET).update(encodedPayload).digest("base64url");
}

export function hashLegacyGuideDownloadToken(rawToken: string) {
  return crypto.createHmac("sha256", DOWNLOAD_SECRET).update(rawToken).digest("hex");
}

export function isLegacyGuideDownloadToken(token: string) {
  return /^[a-f0-9]{64}$/i.test(token);
}

export function createGuideDownloadToken(args: { orderId: string; slug?: string }) {
  const payload: GuideDownloadTokenPayload = {
    orderId: args.orderId,
    slug: args.slug ?? GUIDE_PRODUCT.slug,
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  return `${encodedPayload}.${signPayload(encodedPayload)}`;
}

export function verifyGuideDownloadToken(token: string) {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = signPayload(encodedPayload);
  if (signature.length !== expectedSignature.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as GuideDownloadTokenPayload;
    if (!payload?.orderId || !payload?.slug) return null;
    return payload;
  } catch {
    return null;
  }
}

export function buildGuideDownloadUrl(args: { orderId: string; slug?: string }) {
  const token = createGuideDownloadToken(args);
  return `${APP_URL}/api/guides/download?token=${encodeURIComponent(token)}`;
}

export function getGuidePdfAbsolutePath() {
  return path.join(process.cwd(), GUIDE_PRODUCT.pdfStoragePath);
}
