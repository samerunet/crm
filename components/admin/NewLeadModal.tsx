// FILE: components/admin/NewLeadModal.tsx  (DROP-IN REPLACEMENT)
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Lead, LeadStage, STAGES } from "./types";
import { createLead, LeadStageEnum, type Lead as ApiLead } from "@/lib/api";
import { emitDashboardDataChange } from "@/lib/dashboard/events";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (lead: Lead) => void;
  /** Optional: prefill service date when invoked from calendar */
  initialDate?: Date;
  /** Optional: override stage options */
  stages?: LeadStage[];
  mapApiLead?: (lead: ApiLead) => Lead;
};

const LEGACY_TO_STAGE: Record<LeadStage, LeadStageEnum> = {
  uncontacted: LeadStageEnum.NEW,
  contacted: LeadStageEnum.CONTACTED,
  deposit: LeadStageEnum.DEPOSIT_RECEIVED,
  trial: LeadStageEnum.CONSULT_TRIAL,
  booked: LeadStageEnum.SCHEDULED,
  confirmed: LeadStageEnum.CONTRACT_SIGNED,
  changes: LeadStageEnum.PROPOSAL_SENT,
  completed: LeadStageEnum.COMPLETED,
  lost: LeadStageEnum.LOST,
};

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
  mapApiLead,
}: Props) {
  const stageOptions = useMemo(
    () => (stages && stages.length ? stages : STAGES),
    [stages]
  );

  // form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<LeadStage>(stageOptions[0] ?? "uncontacted");
  const [serviceDate, setServiceDate] = useState<string>(toYMD(initialDate));
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // keep stage default in sync if stages prop changes
  useEffect(() => {
    setStage((prev) =>
      stageOptions.includes(prev) ? prev : stageOptions[0] ?? "uncontacted"
    );
  }, [stageOptions]);

  // prefill date when modal opens from calendar
  useEffect(() => {
    if (open) setServiceDate(toYMD(initialDate) || "");
  }, [open, initialDate]);

  const disabled = !name.trim() || loading;

  const handleSubmit = async () => {
    if (disabled) return;
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim() || null,
        email: email.trim() || null,
        stage: LEGACY_TO_STAGE[stage] ?? LeadStageEnum.NEW,
        eventDate: serviceDate ? `${serviceDate}T00:00:00.000Z` : null,
        message: notes.trim() || null,
      };
      const apiLead = await createLead(payload);
      emitDashboardDataChange();
      const legacy = mapApiLead ? mapApiLead(apiLead) : (apiLead as unknown as Lead);
      onCreate(legacy);
      onClose();
    } catch (err) {
      console.error("Failed to create lead", err);
      setError(err instanceof Error ? err.message : "Failed to create lead");
    } finally {
      setLoading(false);
    }
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
                  {stageOptions.map((s) => (
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
            {error ? (
              <div className="rounded-[--radius-lg] border border-amber-400/60 bg-amber-500/10 px-3 py-2 text-xs text-amber-50">
                {error}
              </div>
            ) : null}
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
              onClick={() => void handleSubmit()}
              className={`gbtn h-9 rounded-xl px-3 text-sm ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {loading ? "Saving…" : "Create lead"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
