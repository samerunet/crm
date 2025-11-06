"use client";

import { useEffect, useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import GuidePaymentForm from "@/components/GuidePaymentForm";

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export default function CheckoutForm() {
  const stripePromise = useMemo(() => (publishableKey ? loadStripe(publishableKey) : null), []);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/payments/intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: "makeup-guide" }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data?.clientSecret) {
          throw new Error(data?.error || "Unable to create payment intent");
        }
        setClientSecret(data.clientSecret);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Unable to load checkout");
      });
  }, []);

  if (!publishableKey || !stripePromise) {
    return (
      <div className="liquid-card space-y-3 p-5 text-sm opacity-85">
        <p className="text-base font-semibold text-[--color-foreground]">Stripe not configured</p>
        <p>Add <code className="mx-1 rounded bg-card/60 px-1 py-0.5 text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to your environment.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="liquid-card space-y-3 p-5 text-sm text-red-600">
        <p className="text-base font-semibold">Checkout unavailable</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!clientSecret) {
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
      <GuidePaymentForm clientSecret={clientSecret} />
    </div>
  );
}
