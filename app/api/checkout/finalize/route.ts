import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import { fulfillGuideCheckoutSession } from "@/lib/guide-purchase-fulfillment";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    if (!stripe) {
      return NextResponse.json({ ok: false, error: "Stripe not configured" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const sessionId =
      typeof body?.sessionId === "string" && body.sessionId.trim().length
        ? body.sessionId.trim()
        : "";
    const forceNotification = body?.forceNotification === true;

    if (!sessionId) {
      return NextResponse.json({ ok: false, error: "sessionId is required" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const result = await fulfillGuideCheckoutSession(session, { forceNotification });

    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Unable to finalize checkout" },
      { status: 500 },
    );
  }
}
