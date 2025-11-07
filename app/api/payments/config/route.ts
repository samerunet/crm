import { NextResponse } from "next/server";

export function GET() {
  const publishableKey =
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    process.env.STRIPE_PUBLISHABLE_KEY ||
    "";

  if (!publishableKey) {
    return NextResponse.json(
      { error: "Stripe publishable key missing" },
      { status: 500 },
    );
  }

  return NextResponse.json({ publishableKey });
}
