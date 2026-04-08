"use client";

import { useEffect, useRef, useState } from "react";

export default function GuidePurchaseFinalizer({ sessionId }: { sessionId?: string }) {
  const startedRef = useRef(false);
  const redirectedRef = useRef(false);
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
        if (!active) return;
        if (typeof data?.downloadUrl === "string" && data.downloadUrl.length) {
          setDownloadUrl(data.downloadUrl);
        }
        setState("done");
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
    if (!downloadUrl || redirectedRef.current) return;
    redirectedRef.current = true;
    window.location.assign(downloadUrl);
  }, [downloadUrl]);

  if (!sessionId) return null;

  if (state === "loading") {
    return <p className="text-sm opacity-80">Finalizing your order and preparing your download…</p>;
  }

  if (state === "error") {
    return (
      <p className="text-sm text-amber-700">
        Payment appears complete, but delivery is still being finalized. Please refresh this page in
        a few seconds.
      </p>
    );
  }

  if (state === "done") {
    return (
      <div className="space-y-2">
        <p className="text-sm opacity-80">
          Your guide should begin downloading automatically. We&apos;re also emailing you a backup
          download link.
        </p>
        {downloadUrl ? (
          <a href={downloadUrl} className="inline-flex text-sm underline underline-offset-4">
            Download the guide again
          </a>
        ) : null}
      </div>
    );
  }

  return null;
}
