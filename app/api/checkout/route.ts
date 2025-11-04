import Stripe from "stripe";

export const runtime = "nodejs";

const secret = process.env.STRIPE_SECRET_KEY;
const stripe = secret ? new Stripe(secret, { apiVersion: "2024-06-20" }) : null;

export async function POST(req: Request) {
  try {
    if (!stripe) {
      return new Response(
        JSON.stringify({ error: "Stripe not configured" }),
        { status: 500, headers: { "content-type": "application/json" } },
      );
    }

    const origin = req.headers.get("origin") ?? new URL(req.url).origin;
    const body = await req.json().catch(() => ({}));
    const email = typeof body?.email === "string" ? body.email : undefined;

    const priceId = process.env.STRIPE_PRICE_GUIDE || "";
    const productId = process.env.STRIPE_PRODUCT_GUIDE || "";
    const amountCents = Number(process.env.PRICE_AMOUNT_CENTS || 2999);
    const currency = process.env.PRICE_CURRENCY || "usd";

    const line_items =
      priceId.startsWith("price_")
        ? [{ price: priceId, quantity: 1 }]
        : productId.startsWith("prod_")
          ? [{
              price_data: {
                product: productId,
                currency,
                unit_amount: amountCents,
              },
              quantity: 1,
            }]
          : [{
              price_data: {
                product_data: { name: "Makeup Guide" },
                currency,
                unit_amount: amountCents,
              },
              quantity: 1,
            }];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${origin}/guide/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/banner/guide`,
      ...(email ? { customer_email: email } : {}),
    });

    return Response.json({ url: session.url }, { status: 200 });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || "Stripe error" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
