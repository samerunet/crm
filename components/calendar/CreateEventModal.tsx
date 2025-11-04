"use client";

import { useEffect, useState } from "react";
import type { Appointment, AppointmentStatus, Lead } from "@/lib/api";
import { AppointmentStatusEnum, createAppointment, listLeads } from "@/lib/api";
import { emitDashboardDataChange } from "@/lib/dashboard/events";

const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: AppointmentStatusEnum.TENTATIVE, label: "Tentative" },
  { value: AppointmentStatusEnum.CONFIRMED, label: "Confirmed" },
  { value: AppointmentStatusEnum.COMPLETED, label: "Completed" },
  { value: AppointmentStatusEnum.CANCELED, label: "Canceled" },
];

/* eslint-disable no-unused-vars */
type CreateEventModalProps = {
  open: boolean;
  onClose: () => void;
  defaultDate?: Date;
  defaultLeadId?: string | null;
  onCreated?: (_appointment: Appointment) => void;
};
/* eslint-enable no-unused-vars */

export default function CreateEventModal({ open, onClose, defaultDate, defaultLeadId, onCreated }: CreateEventModalProps) {
  const [title, setTitle] = useState("");
  const [leadId, setLeadId] = useState<string>("");
  const [status, setStatus] = useState<AppointmentStatus>(AppointmentStatusEnum.TENTATIVE);
  const [start, setStart] = useState<string>("");
  const [end, setEnd] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    void listLeads({ stage: undefined }).then(setLeads).catch((err) => {
      console.error("Failed to load leads", err);
    });
  }, [open]);

  useEffect(() => {
    if (open && defaultDate) {
      const iso = defaultDate.toISOString().slice(0, 16);
      setStart(iso);
      setEnd(iso);
    }
  }, [defaultDate, open]);

  useEffect(() => {
    if (open) {
      setLeadId(defaultLeadId ?? "");
    }
  }, [defaultLeadId, open]);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setLeadId("");
      setStatus(AppointmentStatusEnum.TENTATIVE);
      setStart("");
      setEnd("");
      setLocation("");
      setNotes("");
      setError(null);
    }
  }, [open]);

  const disabled = !title.trim() || !start;

  const handleSubmit = async () => {
    if (disabled) return;
    setLoading(true);
    setError(null);
    try {
      const appointment = await createAppointment({
        title: title.trim(),
        leadId: leadId || undefined,
        status,
        start: new Date(start).toISOString(),
        end: end ? new Date(end).toISOString() : undefined,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      emitDashboardDataChange();
      onCreated?.(appointment);
      onClose();
    } catch (err) {
      console.error("Failed to create appointment", err);
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120]">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center p-4">
        <div className="pointer-events-auto glass-strong w-full max-w-[520px] rounded-[--radius-xl] border border-[--color-border]/60 bg-[--color-card] shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
          <header className="border-b border-[--color-border]/40 px-4 py-3 text-lg font-semibold text-[--color-foreground]">
            Create event
          </header>
          <div className="space-y-4 px-4 py-4 text-sm">
            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-wide text-[--color-muted-foreground]">Title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-[--radius-lg] border border-[--color-border]/60 bg-[--color-card] px-3 py-2"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-wide text-[--color-muted-foreground]">Client</span>
              <select
                value={leadId}
                onChange={(event) => setLeadId(event.target.value)}
                className="w-full rounded-[--radius-lg] border border-[--color-border]/60 bg-[--color-card] px-3 py-2"
              >
                <option value="">Select lead (optional)</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name || lead.email}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-xs uppercase tracking-wide text-[--color-muted-foreground]">Start</span>
                <input
                  type="datetime-local"
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                  className="w-full rounded-[--radius-lg] border border-[--color-border]/60 bg-[--color-card] px-3 py-2"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs uppercase tracking-wide text-[--color-muted-foreground]">End</span>
                <input
                  type="datetime-local"
                  value={end}
                  onChange={(event) => setEnd(event.target.value)}
                  className="w-full rounded-[--radius-lg] border border-[--color-border]/60 bg-[--color-card] px-3 py-2"
                />
              </label>
            </div>
            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-wide text-[--color-muted-foreground]">Status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as AppointmentStatus)}
                className="w-full rounded-[--radius-lg] border border-[--color-border]/60 bg-[--color-card] px-3 py-2"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-wide text-[--color-muted-foreground]">Location</span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className="w-full rounded-[--radius-lg] border border-[--color-border]/60 bg-[--color-card] px-3 py-2"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs uppercase tracking-wide text-[--color-muted-foreground]">Notes</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="min-h-[80px] w-full rounded-[--radius-lg] border border-[--color-border]/60 bg-[--color-card] px-3 py-2"
              />
            </label>
            {error ? (
              <div className="rounded-[--radius-lg] border border-amber-400/60 bg-amber-500/10 px-3 py-2 text-xs text-amber-50">
                {error}
              </div>
            ) : null}
          </div>
          <footer className="flex items-center justify-between gap-2 border-t border-[--color-border]/40 px-4 py-3">
            <button
              type="button"
              onClick={onClose}
              className="icon-chip rounded-[--radius-lg] px-3 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={disabled || loading}
              onClick={() => void handleSubmit()}
              className="gbtn rounded-[--radius-lg] px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving…" : "Create"}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
