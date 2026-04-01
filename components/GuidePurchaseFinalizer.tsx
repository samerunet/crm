"use client";

import { useEffect, useRef, useState } from "react";

export default function GuidePurchaseFinalizer({ sessionId }: { sessionId?: string }) {
  const startedRef = useRef(false);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  useEffect(() => {
    if (!sessionId || startedRef.current) return;
    startedRef.current = true;

    let active = true;
    setState("loading");

    fetch("/api/checkout/finalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data?.ok === false) {
          throw new Error(data?.error || `HTTP ${res.status}`);
        }
        if (active) setState("done");
      })
      .catch((err) => {
        console.error("Checkout finalization failed:", err);
        if (active) setState("error");
      });

    return () => {
      active = false;
    };
  }, [sessionId]);

  if (!sessionId) return null;

  if (state === "loading") {
    return <p className="text-sm opacity-80">Finalizing your order and guide delivery…</p>;
  }

  if (state === "error") {
    return (
      <p className="text-sm text-amber-700">
        Payment appears complete, but delivery confirmation is still being finalized.
      </p>
    );
  }

  if (state === "done") {
    return <p className="text-sm opacity-80">Your order has been recorded successfully.</p>;
  }

  return null;
}
