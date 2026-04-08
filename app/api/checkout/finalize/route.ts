import { NextResponse } from "next/server";

import { fulfillGuideCheckoutSession } from "@/lib/guide-purchase-fulfillment";
import { stripe } from "@/lib/stripe";

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

    if (!sessionId) {
      return NextResponse.json({ ok: false, error: "sessionId is required" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const result = await fulfillGuideCheckoutSession(session);

    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Unable to finalize checkout" },
      { status: 500 },
    );
  }
}

