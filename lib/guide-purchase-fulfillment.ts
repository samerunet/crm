import "server-only";

import crypto from "node:crypto";

import type Stripe from "stripe";

import { buildGuideDownloadUrl } from "@/lib/guide-delivery";
import { prisma } from "@/lib/prisma";
import {
  sendGuideDeliveryEmail,
  sendGuidePurchaseNotification,
} from "@/lib/guide-purchase-notifications";

function buildOrderLockKey(sessionId: string) {
  return crypto.createHash("sha256").update(`guide-order:${sessionId}`).digest("hex");
}

export async function fulfillGuideCheckoutSession(session: Stripe.Checkout.Session) {
  const email = session.customer_details?.email ?? session.customer_email ?? "";
  const name =
    session.customer_details?.name ??
    session.metadata?.customer_name ??
    session.metadata?.name ??
    null;
  const amount = session.amount_total ?? 0;
  const currency = session.currency ?? "usd";
  const status = session.payment_status === "paid" ? "COMPLETED" : "PENDING";
  const slug = session.metadata?.slug ?? "makeup-guide";
  const lockKey = buildOrderLockKey(session.id);

  const [guide, user] = await Promise.all([
    prisma.guide.findUnique({ where: { slug } }),
    email
      ? prisma.user.upsert({
          where: { email },
          create: { email, name },
          update: { name: name ?? undefined },
        })
      : Promise.resolve(null),
  ]);

  let order = await prisma.order.findFirst({
    where: {
      OR: [{ externalRef: session.id }, { guideDownloadTokenHash: lockKey }],
    },
    orderBy: { createdAt: "desc" },
  });

  const previousStatus = order?.status ?? null;

  if (order) {
    const needsUpdate =
      order.status !== status ||
      (user?.id && order.userId !== user.id) ||
      (guide?.id && order.guideId !== guide.id) ||
      order.guideDownloadTokenHash !== lockKey;

    if (needsUpdate) {
      order = await prisma.order.update({
        where: { id: order.id },
        data: {
          status,
          ...(user?.id ? { userId: user.id } : {}),
          ...(guide?.id ? { guideId: guide.id } : {}),
          guideDownloadTokenHash: lockKey,
        },
      });
    }
  } else {
    try {
      order = await prisma.order.create({
        data: {
          userId: user?.id,
          guideId: guide?.id,
          amountCents: amount,
          currency,
          status,
          externalRef: session.id,
          guideDownloadTokenHash: lockKey,
        },
      });
    } catch {
      order = await prisma.order.findFirst({
        where: {
          OR: [{ externalRef: session.id }, { guideDownloadTokenHash: lockKey }],
        },
        orderBy: { createdAt: "desc" },
      });
      if (!order) throw new Error("Unable to create or recover guide order.");
    }
  }

  let internalEmailId: string | null = null;
  let deliveryEmailId: string | null = null;
  const shouldSendEmails = status === "COMPLETED" && previousStatus !== "COMPLETED";

  if (shouldSendEmails) {
    try {
      const internalResult = await sendGuidePurchaseNotification({
        buyerEmail: email,
        buyerName: name,
        guideTitle: guide?.title ?? session.metadata?.productName ?? "Makeup Guide",
        amountCents: amount,
        currency,
        sessionId: session.id,
      });
      internalEmailId = internalResult.id ?? null;
    } catch (notifyErr: any) {
      console.error("Guide purchase notification failed:", notifyErr?.message || notifyErr);
    }

    if (email) {
      try {
        const deliveryResult = await sendGuideDeliveryEmail({
          buyerEmail: email,
          buyerName: name,
          guideTitle: guide?.title ?? session.metadata?.productName ?? "Makeup Guide",
          orderId: order.id,
        });
        deliveryEmailId = deliveryResult.id ?? null;
      } catch (deliveryErr: any) {
        console.error("Guide delivery email failed:", deliveryErr?.message || deliveryErr);
      }
    }
  }

  return {
    ok: true as const,
    duplicate: previousStatus !== null,
    orderId: order.id,
    status: order.status,
    buyerEmail: email || null,
    downloadUrl: order.status === "COMPLETED" ? buildGuideDownloadUrl({ orderId: order.id }) : null,
    deliveryEmailId,
    internalEmailId,
  };
}

