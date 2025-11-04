"use client";

export default function CheckoutForm() {
  return (
    <div className="space-y-3 rounded-[var(--radius)] border border-dashed border-[color:var(--color-border)] bg-[rgba(255,255,255,.45)] p-4 text-sm text-[var(--color-muted-foreground)]">
      <p className="font-medium text-[var(--color-foreground)]">Checkout temporarily unavailable</p>
      <p>
        We&apos;re updating the payment flow for this guide. Please check back soon or reach out to
        hello@farimakeup.com if you need access right away.
      </p>
    </div>
  );
}
