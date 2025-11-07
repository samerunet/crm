"use client";

import { useMemo, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

function Form() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/guide/thanks` },
      redirect: "if_required",
    });

    if (error) setError(error.message || "Payment failed");
    setLoading(false);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="p-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-transparent">
        <PaymentElement />
      </div>
      {error ? <div className="text-red-600 text-sm">{error}</div> : null}
      <button
        disabled={!stripe || loading}
        className="gbtn w-full h-12 rounded-[var(--radius-xl)] grid place-items-center font-medium"
      >
        {loading ? "Processing…" : "Pay $29.99"}
      </button>
    </form>
  );
}

export default function GuidePaymentForm({
  clientSecret,
  publishableKey,
}: {
  clientSecret: string;
  publishableKey: string;
}) {
  const stripePromise = useMemo(() => (publishableKey ? loadStripe(publishableKey) : null), [publishableKey]);

  if (!publishableKey || !stripePromise) {
    return <div className="opacity-80 text-sm">Stripe publishable key missing.</div>;
  }

  const options = {
    clientSecret,
    appearance: {
      theme: "none",
      variables: {
        colorPrimary: "#6C3A22",
        colorBackground: "transparent",
        colorText: "#120D0A",
        borderRadius: "10px",
      },
    },
  } as const;

  return (
    <Elements stripe={stripePromise} options={options}>
      <Form />
    </Elements>
  );
}
