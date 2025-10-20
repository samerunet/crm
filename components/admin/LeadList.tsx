// FILE: components/admin/LeadList.tsx  (DROP-IN REPLACEMENT)
"use client";

import React from "react";
import type { Lead } from "./types";

function StageBadge({ stage }: { stage: Lead["stage"] }) {
  const cls =
    stage === "uncontacted"
      ? "badge badge-new"
      : stage === "completed"
      ? "badge badge-booked"
      : stage === "booked"
      ? "badge badge-booked"
      : stage === "trial"
      ? "badge badge-trial"
      : "badge";
  return <span className={cls}>{stage}</span>;
}
const fmtDate = (d: string | Date | undefined) =>
  d ? new Date(d).toLocaleDateString() : "";

export default function LeadList({
  leads,
  onOpen,
}: {
  leads: Lead[];
  onOpen?: (l: Lead) => void;
}) {
  if (!leads?.length) {
    return (
      <div className="wglass panel text-sm text-muted-foreground">
        No leads match your filters yet.
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {leads.map((l) => (
        <button
          key={l.id}
          className="wglass panel-lg text-left transition hover:bg-white/14 rounded-2xl"
          onClick={() => onOpen?.(l)}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-medium">{l.name || "Untitled lead"}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {l.email || "—"} · {l.phone || "—"}
              </div>
              <div className="mt-1 text-xs">
                {l.dateOfService ? (
                  <>Service date: <span className="font-medium">{fmtDate(l.dateOfService)}</span></>
                ) : (
                  <span className="text-muted-foreground">No service date</span>
                )}
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1">
              <StageBadge stage={l.stage} />
              {(l.tags || []).includes("repeat") && (
                <span className="badge">repeat</span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
