"use client";

import { useDashboardParams, FILTER_KEYS, FilterKey } from "@/lib/hooks/use-dashboard-params";

const LABELS: Record<FilterKey, string> = {
  "new": "New (24h)",
  "awaiting-reply": "Awaiting reply",
  "consult-requested": "Consult requested",
  "deposit-pending": "Deposit pending",
  "contract-pending": "Contract pending",
  "high-budget": "High budget",
};

export default function QuickFilters() {
  const { filters, toggleFilter } = useDashboardParams();
  const active = new Set(filters);

  return (
    <aside className="glass-strong rounded-[calc(var(--radius)+14px)] border border-[--color-border]/50 p-4 shadow-[0_20px_48px_rgba(18,13,10,0.18)]">
      <header className="mb-3 font-medium text-[--color-foreground]">Quick filters</header>
      <div className="flex flex-wrap gap-2">
        {FILTER_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => toggleFilter(key)}
            className={`icon-chip rounded-[--radius-lg] px-3 py-1.5 text-sm transition ${
              active.has(key) ? "bg-[--color-primary] text-[--color-primary-foreground]" : ""
            }`}
          >
            {LABELS[key]}
          </button>
        ))}
      </div>
    </aside>
  );
}
