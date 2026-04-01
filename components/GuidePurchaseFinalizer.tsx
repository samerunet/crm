"use client";

import { useEffect, useRef, useState } from "react";

export default function GuidePurchaseFinalizer({ sessionId }: { sessionId?: string }) {
  const startedRef = useRef(false);
  const downloadedRef = useRef(false);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

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
        if (active && typeof data?.downloadUrl === "string" && data.downloadUrl.length) {
          setDownloadUrl(data.downloadUrl);
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

  useEffect(() => {
    if (!downloadUrl || downloadedRef.current) return;
    downloadedRef.current = true;

    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = "";
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }, [downloadUrl]);

  if (!sessionId) return null;

  if (state === "loading") {
    return <p className="text-sm opacity-80">Finalizing your order and preparing your download…</p>;
  }

  if (state === "error") {
    return (
      <p className="text-sm text-amber-700">
        Payment appears complete, but delivery confirmation is still being finalized.
      </p>
    );
  }

  if (state === "done") {
    return (
      <div className="space-y-2">
        <p className="text-sm opacity-80">
          Your order has been recorded successfully. Your download should begin automatically.
        </p>
        {downloadUrl ? (
          <a
            href={downloadUrl}
            className="inline-flex text-sm underline underline-offset-4"
          >
            Download the guide now
          </a>
        ) : (
          <p className="text-sm opacity-70">
            We’re also sending a one-time-use backup link to your email.
          </p>
        )}
        <p className="text-sm opacity-70">
          Save the PDF as soon as it opens so you keep a copy on your device.
        </p>
      </div>
    );
  }

  return null;
}
