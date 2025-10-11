// FILE: components/admin/NewLeadModal.tsx  (DROP-IN REPLACEMENT)
"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Lead, LeadStage } from "./types";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (lead: Lead) => void;
  /** Optional: prefill service date when invoked from calendar */
  initialDate?: Date;
  /** Optional: override stage options */
  stages?: LeadStage[];
};

const DEFAULT_STAGES: LeadStage[] = [
  "new",
  "contacted",
  "deposit",
  "trial",
  "booked",
  "confirmed",
  "changes",
  "completed",
];

function toYMD(d?: Date | null) {
  if (!d) return "";
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export default function NewLeadModal({
  open,
  onClose,
  onCreate,
  initialDate,
  stages,
}: Props) {
  const STAGES = useMemo(
    () => (stages && stages.length ? stages : DEFAULT_STAGES),
    [stages]
  );

  // form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<LeadStage>(STAGES[0] || "new");
  const [serviceDate, setServiceDate] = useState<string>(toYMD(initialDate));
  const [notes, setNotes] = useState("");

  // keep stage default in sync if stages prop changes
  useEffect(() => {
    setStage((prev) => (STAGES.includes(prev) ? prev : STAGES[0] || "new"));
  }, [STAGES]);

  // prefill date when modal opens from calendar
  useEffect(() => {
    if (open) setServiceDate(toYMD(initialDate) || "");
  }, [open, initialDate]);

  const disabled = !name.trim();

  const handleSubmit = () => {
    if (disabled) return;
    const id = `l_${Date.now()}`;

    const lead: Lead = {
      id,
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      stage,
      lastContactAt: null,
      dateOfService: serviceDate ? (new Date(`${serviceDate}T00:00:00`) as any) : undefined,
      // Safe extras your app already tolerates:
      tags: [],
      // If your Lead type has notes array, you can push later in the editor.
    } as Lead;

    onCreate(lead);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* scrim */}
      <button
        aria-label="Close"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* modal panel */}
      <div className="absolute inset-x-4 sm:inset-x-auto sm:right-6 top-10 sm:top-16 z-[101] w-auto sm:w-[520px]">
        <div className="glass specular rounded-2xl border border-border/70 p-4 sm:p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base sm:text-lg font-semibold">New lead</h3>
            <button
              onClick={onClose}
              className="icon-chip h-9 w-9 inline-grid place-items-center rounded-xl"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 grid gap-3">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Name *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Client full name"
                className="crm-input"
              />
            </div>

            <div className="grid gap-1.5 sm:grid-cols-2 sm:gap-3">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Phone</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 555-5555"
                  className="crm-input"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@email.com"
                  className="crm-input"
                />
              </div>
            </div>

            <div className="grid gap-1.5 sm:grid-cols-2 sm:gap-3">
              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Stage</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as LeadStage)}
                  className="crm-input"
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-medium">Service date</label>
                <input
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className="crm-input"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any details to remember…"
                className="crm-input min-h-[90px]"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="h-9 rounded-xl border border-border/70 px-3 text-sm hover:bg-accent/20"
            >
              Cancel
            </button>
            <button
              disabled={disabled}
              onClick={handleSubmit}
              className={`gbtn h-9 rounded-xl px-3 text-sm ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              Create lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
