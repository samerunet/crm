"use client";

import { useState } from "react";

type Props = {
  lead: any;
  options?: Record<string, unknown>;
};

export default function DownloadContractPDF({ lead, options }: Props) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      onClick={async () => {
        try {
          setLoading(true);
          const res = await fetch("/api/contract/pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lead, options }),
          });
          if (!res.ok) throw new Error("Failed to generate PDF");
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = url;
          anchor.download = `contract-${lead?.id || "preview"}.pdf`;
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();
          URL.revokeObjectURL(url);
        } finally {
          setLoading(false);
        }
      }}
      disabled={loading}
      className="gbtn rounded-[var(--radius-md)] px-4 py-2"
    >
      {loading ? "Generating…" : "Download PDF"}
    </button>
  );
}
