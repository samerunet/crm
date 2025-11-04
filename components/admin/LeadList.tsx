// FILE: components/admin/LeadList.tsx  (DROP-IN REPLACEMENT)
"use client";

import type { Lead } from "./types";

const stageClasses: Record<Lead["stage"], string> = {
  uncontacted: "bg-[--color-muted]/30 text-[--color-muted-foreground]",
  contacted: "bg-[--color-accent]/20 text-[--color-accent-foreground]",
  deposit: "bg-[--color-secondary]/25 text-[--color-secondary-foreground]",
  trial: "bg-[--color-secondary]/30 text-[--color-secondary-foreground]",
  booked: "bg-[--color-primary]/20 text-[--color-primary-foreground]",
  confirmed: "bg-[--color-primary]/25 text-[--color-primary-foreground]",
  changes: "bg-[--color-accent]/20 text-[--color-accent-foreground]",
  completed: "bg-[--color-primary]/30 text-[--color-primary-foreground]",
  lost: "bg-[--color-destructive]/20 text-[--color-destructive-foreground]",
};

const fmtDate = (value: string | Date | undefined) =>
  value ? new Date(value).toLocaleDateString() : "";

function StageBadge({ stage }: { stage: Lead["stage"] }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide",
        stageClasses[stage] ?? "bg-[--color-muted]/30 text-[--color-muted-foreground]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {stage.replace("_", " ")}
    </span>
  );
}

export default function LeadList({
  leads,
  onOpen,
  compact = false,
}: {
  leads: Lead[];
  onOpen?: (lead: Lead) => void;
  compact?: boolean;
}) {
  if (!leads?.length) {
    return (
      <div className="glass rounded-[--radius-xl] border border-dashed border-[--color-border]/60 px-4 py-6 text-center text-sm text-[--color-muted-foreground]">
        No leads match your filters yet.
      </div>
    );
  }

  return (
    <div className="grid gap-2">
      {leads.map((lead) => (
        <button
          key={lead.id}
          type="button"
          onClick={() => onOpen?.(lead)}
          className={[
            "glass text-left transition",
            compact ? "rounded-[--radius-lg] px-3 py-2" : "rounded-[--radius-xl] px-4 py-3",
            "border border-[--color-border]/50 hover:border-[--color-border] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[--color-ring]",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-[--color-foreground]">
                {lead.name || "Untitled lead"}
              </div>
              <div className="text-xs text-[--color-muted-foreground]">
                {lead.email || "—"}
                <span className="mx-1">•</span>
                {lead.phone || "—"}
              </div>
              <div className="text-xs text-[--color-muted-foreground]">
                {lead.dateOfService ? (
                  <>
                    Service date: <span className="font-medium text-[--color-foreground]">{fmtDate(lead.dateOfService)}</span>
                  </>
                ) : (
                  <span>No service date</span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <StageBadge stage={lead.stage} />
              {(lead.tags || []).includes("repeat") ? (
                <span className="inline-flex items-center rounded-full bg-[--color-secondary]/20 px-2 py-1 text-[0.65rem] font-medium uppercase tracking-wide text-[--color-secondary-foreground]">
                  repeat
                </span>
              ) : null}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
