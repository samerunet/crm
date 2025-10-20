// FILE: components/admin/LeadDrawer.tsx
import React from "react";
import type { Lead } from "./types";

export default function LeadDrawer({
  open, onClose, lead, onSaveNote,
}: {
  open: boolean; onClose: ()=>void; lead: Lead | null; onSaveNote: (id:string,note:string)=>void;
}) {
  const [val, setVal] = React.useState("");
  if (!open || !lead) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/55 z-40" onClick={onClose} />
      <aside
        className="
          fixed right-0 top-0 bottom-0 z-50 w-[92vw] max-w-[520px]
          border-l border-[var(--border)]
          bg-[color-mix(in_oklab,var(--popover)_90%,transparent)] backdrop-blur-2xl
          shadow-[0_22px_70px_rgba(0,0,0,.24)]
          p-5 sm:p-6 overflow-y-auto
        "
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">{lead.name}</h3>
          <button
            onClick={onClose}
            className="h-9 px-3 rounded-lg border border-[var(--border)] bg-card/60 hover:bg-accent/15"
          >
            Close
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          <div className="
            rounded-2xl border border-[var(--border)]
            bg-[color-mix(in_oklab,var(--card)_18%,transparent)] backdrop-blur-xl p-4
          ">
            <div className="text-sm text-foreground/70 space-y-1">
              <div>Phone: {lead.phone || "—"}</div>
              <div>Email: {lead.email || "—"}</div>
              {lead.dateOfService && (
                <div>
                  Service date:{" "}
                  {new Date(lead.dateOfService).toLocaleDateString([], {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              )}
              {lead.address && (
                <div className="text-muted-foreground">
                  {[lead.address.line1, lead.address.line2].filter(Boolean).join(" ")}
                  <br />
                  {[lead.address.city, lead.address.state, lead.address.zip].filter(Boolean).join(", ")}
                </div>
              )}
            </div>
          </div>

          <div className="
            rounded-2xl border border-[var(--border)]
            bg-[color-mix(in_oklab,var(--card)_18%,transparent)] backdrop-blur-xl p-4
          ">
            <div className="text-sm font-medium">Notes</div>
            <textarea
              value={val} onChange={e=>setVal(e.target.value)}
              placeholder="Add a quick note…"
              className="mt-2 w-full min-h-[110px] rounded-xl border border-[var(--border)] bg-background/30 px-3 py-2.5 placeholder:text-foreground/50"
            />
            <div className="mt-3 flex justify-end">
              <button
                onClick={()=>{ if(val.trim()) onSaveNote(lead.id, val.trim()); setVal(""); }}
                className="h-10 px-4 rounded-xl bg-primary text-primary-foreground hover:opacity-95"
              >
                Save note
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
