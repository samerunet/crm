"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import GuidePaymentForm from "@/components/GuidePaymentForm";

const buildTimePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null;

export default function CheckoutForm() {
  const [publishableKey, setPublishableKey] = useState<string | null>(buildTimePublishableKey);
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      try {
        let resolvedKey = buildTimePublishableKey;
        try {
          const configRes = await fetch("/api/payments/config", { cache: "no-store" });
          const config = await configRes.json();
          if (configRes.ok && config?.publishableKey) {
            resolvedKey = config.publishableKey;
          } else if (!buildTimePublishableKey) {
            throw new Error(config?.error || "Stripe publishable key missing");
          }
        } catch (configErr) {
          console.error(configErr);
          if (!buildTimePublishableKey) {
            throw configErr instanceof Error ? configErr : new Error("Stripe publishable key missing");
          }
        }

        if (!resolvedKey) {
          throw new Error("Stripe publishable key missing");
        }

        if (active) {
          setPublishableKey(resolvedKey);
        }

        const stripeInstance = await loadStripe(resolvedKey).catch((stripeErr) => {
          throw stripeErr instanceof Error
            ? stripeErr
            : new Error("Failed to load Stripe.js");
        });

        if (!stripeInstance) {
          throw new Error("Failed to load Stripe.js");
        }

        if (active) {
          setStripe(stripeInstance);
        }

        const intentRes = await fetch("/api/payments/intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product: "makeup-guide" }),
        });
        const intent = await intentRes.json();
        if (!intentRes.ok || !intent?.clientSecret) {
          throw new Error(intent?.error || "Unable to create payment intent");
        }

        if (!active) return;
        setClientSecret(intent.clientSecret);
      } catch (err: any) {
        console.error(err);
        if (!active) return;
        if (!buildTimePublishableKey || err?.message?.toLowerCase().includes("publishable")) {
          setConfigError(err?.message || "Stripe configuration missing");
        } else {
          setError(err?.message || "Unable to load checkout");
        }
      }
    }

    bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const checkoutFallback = (
    <div className="space-y-3">
      <p className="text-sm opacity-80">
        Try the hosted Stripe Checkout page instead if embedded checkout cannot load in this browser.
      </p>
      <Link
        href="/pay/guide"
        className="gbtn inline-flex h-11 items-center justify-center rounded-[var(--radius-xl)] px-5 font-medium"
      >
        Open hosted checkout
      </Link>
    </div>
  );

  if (configError) {
    return (
      <div className="liquid-card space-y-3 p-5 text-sm opacity-85">
        <p className="text-base font-semibold text-[--color-foreground]">Stripe not configured</p>
        <p>{configError}</p>
        {checkoutFallback}
      </div>
    );
  }

  if (!publishableKey) {
    return (
      <div className="liquid-card space-y-3 p-5 text-sm opacity-85">
        <p className="text-base font-semibold text-[--color-foreground]">Stripe not configured</p>
        <p>Add <code className="mx-1 rounded bg-card/60 px-1 py-0.5 text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to your environment.</p>
        {checkoutFallback}
      </div>
    );
  }

  if (error) {
    return (
      <div className="liquid-card space-y-3 p-5 text-sm text-red-600">
        <p className="text-base font-semibold">Checkout unavailable</p>
        <p>{error}</p>
        {checkoutFallback}
      </div>
    );
  }

  if (!stripe || !clientSecret) {
    return <div className="liquid-card p-5 text-sm opacity-80">Loading secure checkout…</div>;
  }

  return (
    <div className="liquid-card space-y-4 p-5 sm:p-6">
      <div>
        <p className="text-base font-semibold text-[--color-foreground]">Secure checkout</p>
        <p className="text-sm opacity-80">
          Card details are encrypted and processed by Stripe. Apple Pay / Google Pay appear automatically when available.
        </p>
      </div>
      <GuidePaymentForm clientSecret={clientSecret} stripe={stripe} />
    </div>
  );
}
