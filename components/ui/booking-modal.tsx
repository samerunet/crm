// components/ui/booking-modal.tsx
"use client";

import { useEffect, useRef } from "react";

type Service = { id: string; title: string };
type AddOn = { id: string; label: string; price?: string };

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  service?: Service;
  addOns?: AddOn[];
}

export default function BookingModal({
  open,
  onClose,
  service,
  addOns = [],
}: BookingModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Booking"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* BACKDROP — clicking it closes */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* PANEL — stop click from bubbling to backdrop */}
      <div
        ref={panelRef}
        className="glass specular relative z-10 w-full max-w-lg rounded-2xl border border-border p-5 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Request Booking</h3>
            <p className="mt-1 text-sm text-foreground/70">
              {service ? service.title : "General inquiry"}
            </p>
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="rounded-md border border-border bg-card/70 px-2.5 py-1 text-sm hover:bg-accent/15"
          >
            ✕
          </button>
        </div>

        {/* Form (lightweight placeholder fields; wire up later) */}
        <form
          className="mt-4 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            // handle submit later
            onClose();
          }}
        >
          <label className="grid gap-1">
            <span className="text-sm">Name</span>
            <input
              className="rounded-md border border-border bg-card/70 px-3 py-2 outline-none"
              placeholder="Your full name"
              required
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Email</span>
            <input
              type="email"
              className="rounded-md border border-border bg-card/70 px-3 py-2 outline-none"
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Phone (for text reply)</span>
            <input
              type="tel"
              className="rounded-md border border-border bg-card/70 px-3 py-2 outline-none"
              placeholder="(555) 555-5555"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm">Event date</span>
            <input
              type="date"
              className="rounded-md border border-border bg-card/70 px-3 py-2 outline-none"
              required
            />
          </label>

          {!!addOns.length && (
            <fieldset className="mt-2">
              <legend className="mb-2 text-sm font-medium">Add-ons</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {addOns.map((a) => (
                  <label key={a.id} className="flex items-center gap-2 rounded-md border border-border bg-card/60 px-3 py-2">
                    <input type="checkbox" className="accent-[var(--accent)]" />
                    <span className="text-sm">
                      {a.label}
                      {a.price ? <span className="ml-1 opacity-70">({a.price})</span> : null}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <label className="grid gap-1">
            <span className="text-sm">Notes</span>
            <textarea
              rows={3}
              className="rounded-md border border-border bg-card/70 px-3 py-2 outline-none"
              placeholder="Tell us about your event (location, start time, party size, etc.)"
            />
          </label>

          {/* Actions */}
          <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border bg-card/70 px-4 py-2 text-sm hover:bg-accent/15"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent"
            >
              Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
