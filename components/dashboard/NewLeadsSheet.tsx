"use client";

import type { Lead } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

/* eslint-disable no-unused-vars */
type NewLeadsSheetProps = {
  open: boolean;
  leads: Lead[];
  onClose: () => void;
  onSelect: (_lead: Lead) => void;
  onCreate?: () => void;
};
/* eslint-enable no-unused-vars */

export default function NewLeadsSheet({ open, leads, onClose, onSelect, onCreate }: NewLeadsSheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110]">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
        <div className="pointer-events-auto h-full w-[360px] glass-strong border-l border-[--color-border]/60 bg-[--color-card] shadow-[-16px_0_40px_rgba(0,0,0,0.28)]">
          <header className="flex items-center justify-between border-b border-[--color-border]/40 px-4 py-3">
            <div>
              <div className="text-sm font-semibold text-[--color-foreground]">New leads (last 24h)</div>
              <div className="text-xs text-[--color-muted-foreground]">{leads.length} {leads.length === 1 ? "lead" : "leads"}</div>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="icon-chip h-9 w-9 rounded-full"
            >
              ✕
            </button>
          </header>
          <div className="h-full overflow-y-auto px-4 py-4 space-y-2">
            {leads.length === 0 ? (
              <p className="text-sm text-[--color-muted-foreground]">
                No new inquiries yet — check back soon.
              </p>
            ) : (
              leads.map((lead) => (
                <button
                  key={lead.id}
                  type="button"
                  onClick={() => onSelect(lead)}
                  className="w-full rounded-[--radius-lg] border border-[--color-border]/50 bg-[--color-card] px-3 py-2 text-left transition hover:border-[--color-border] hover:bg-[rgba(18,13,10,0.08)]"
                >
                  <div className="text-sm font-medium text-[--color-foreground]">{lead.name || lead.email}</div>
                  <div className="text-xs text-[--color-muted-foreground]">
                    {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                  </div>
                  <div className="mt-1 text-xs text-[--color-muted-foreground]">
                    {lead.email}{lead.phone ? ` • ${lead.phone}` : ""}
                  </div>
                </button>
              ))
            )}
          </div>
          <footer className="border-t border-[--color-border]/40 px-4 py-3">
            <button
              type="button"
              onClick={onCreate}
              className="gbtn w-full rounded-[--radius-lg] px-3 py-2 text-sm"
            >
              Start new inquiry
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
