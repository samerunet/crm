import "server-only";

import type Stripe from "stripe";

import { prisma } from "@/lib/prisma";
import {
  sendGuideDeliveryEmail,
  sendGuidePurchaseNotification,
} from "@/lib/guide-purchase-notifications";

export async function fulfillGuideCheckoutSession(
  session: Stripe.Checkout.Session,
  options?: { forceEmails?: boolean },
) {
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
  const guide = await prisma.guide.findUnique({ where: { slug } });

  const existingOrder = await prisma.order.findFirst({ where: { externalRef: session.id } });
  if (existingOrder) {
    let internalEmailId: string | null = null;
    let deliveryEmailId: string | null = null;
    if (status === "COMPLETED" && options?.forceEmails) {
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
        console.error("Guide purchase notification replay failed:", notifyErr?.message || notifyErr);
      }
      try {
        const deliveryResult = await sendGuideDeliveryEmail({
          buyerEmail: email,
          buyerName: name,
          guideTitle: guide?.title ?? session.metadata?.productName ?? "Makeup Guide",
          sessionId: session.id,
        });
        deliveryEmailId = deliveryResult.id ?? null;
      } catch (deliveryErr: any) {
        console.error("Guide delivery replay failed:", deliveryErr?.message || deliveryErr);
      }
    }

    return {
      ok: true as const,
      duplicate: true as const,
      orderId: existingOrder.id,
      status: existingOrder.status,
      buyerEmail: email || null,
      deliveryEmailId,
      internalEmailId,
    };
  }

  const user = email
    ? await prisma.user.upsert({
        where: { email },
        create: { email, name },
        update: { name: name ?? undefined },
      })
    : null;
  const order = await prisma.order.create({
    data: {
      userId: user?.id,
      guideId: guide?.id,
      amountCents: amount,
      currency,
      status,
      externalRef: session.id,
    },
  });

  let internalEmailId: string | null = null;
  let deliveryEmailId: string | null = null;
  if (status === "COMPLETED") {
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
    try {
      const deliveryResult = await sendGuideDeliveryEmail({
        buyerEmail: email,
        buyerName: name,
        guideTitle: guide?.title ?? session.metadata?.productName ?? "Makeup Guide",
        sessionId: session.id,
      });
      deliveryEmailId = deliveryResult.id ?? null;
    } catch (deliveryErr: any) {
      console.error("Guide delivery email failed:", deliveryErr?.message || deliveryErr);
    }
  }

  return {
    ok: true as const,
    duplicate: false as const,
    orderId: order.id,
    status,
    buyerEmail: email || null,
    deliveryEmailId,
    internalEmailId,
  };
}
