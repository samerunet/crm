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
    const name = typeof body?.name === "string" ? body.name : undefined;
    const amountOverride =
      typeof body?.amountCents === "number" && Number.isFinite(body.amountCents)
        ? Math.max(body.amountCents, 100)
        : undefined;
    const productOverride =
      typeof body?.productName === "string" && body.productName.trim().length
        ? body.productName.trim()
        : undefined;

    const priceId = process.env.STRIPE_PRICE_GUIDE || "";
    const productId = process.env.STRIPE_PRODUCT_GUIDE || "";
    const amountCents = amountOverride ?? Number(process.env.PRICE_AMOUNT_CENTS || 2999);
    const currency = process.env.PRICE_CURRENCY || "usd";

    const usingPriceId = priceId.startsWith("price_");
    const usingProductId = !usingPriceId && productId.startsWith("prod_");

    const line_items =
      usingPriceId
        ? [{ price: priceId, quantity: 1 }]
        : usingProductId
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
                product_data: { name: productOverride || "Makeup Guide" },
                currency,
                unit_amount: amountCents,
              },
              quantity: 1,
            }];

    const sessionPayload = {
      mode: "payment",
      line_items,
      success_url: `${origin}/guide/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pay/guide?canceled=1`,
      ...(email ? { customer_email: email } : {}),
      metadata: {
        ...(name ? { customer_name: name } : {}),
        slug: "makeup-guide",
        productName: productOverride || "Makeup Guide",
      },
    } as const;

    console.log("[checkout] creating session payload", sessionPayload);

    const session = await stripe.checkout.sessions.create(sessionPayload);

    return Response.json({
      url: session.url,
      debug: {
        usingPriceId,
        usingProductId,
        priceId,
        productId,
        amountCents,
        line_items,
      },
    }, { status: 200 });
  } catch (err: any) {
    console.error("POST /api/checkout failed", err);
    console.error("Stripe payload debug", {
      priceId: process.env.STRIPE_PRICE_GUIDE,
      productId: process.env.STRIPE_PRODUCT_GUIDE,
      priceAmountCents: process.env.PRICE_AMOUNT_CENTS,
      priceCurrency: process.env.PRICE_CURRENCY,
    });
    return new Response(
      JSON.stringify({
        error: err?.message || "Stripe error",
        debug: {
          priceId: process.env.STRIPE_PRICE_GUIDE || null,
          productId: process.env.STRIPE_PRODUCT_GUIDE || null,
          priceAmountCents: process.env.PRICE_AMOUNT_CENTS || null,
          priceCurrency: process.env.PRICE_CURRENCY || null,
        },
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
