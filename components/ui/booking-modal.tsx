// components/ui/booking-modal.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type AddOn = { id: string; label: string; price?: string };
type Service = { id: string; title: string };

type Props = {
  open: boolean;
  onClose: () => void;
  service?: Service | null;
  addOns?: AddOn[];
};

export default function BookingModal({ open, onClose, service, addOns = [] }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    name: "",
    eventDate: "",
    location: "",
    partySize: "",
    notes: "",
    contactMethod: "sms" as "sms" | "email",
    phone: "",
    email: "",
    selectedAddOns: [] as string[],
  });

  // Reset + focus when opened
  useEffect(() => {
    if (!open) return;
    setForm((f) => ({ ...f, selectedAddOns: [] }));
    const t = setTimeout(() => {
      dialogRef.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
    }, 50);
    return () => clearTimeout(t);
  }, [open, service?.id]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock background scroll
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const toggleAddOn = (id: string) =>
    setForm((f) => {
      const s = new Set(f.selectedAddOns);
      s.has(id) ? s.delete(id) : s.add(id);
      return { ...f, selectedAddOns: [...s] };
    });

  const submit = async (channel: "sms" | "email") => {
    if (!form.name || !form.eventDate || !form.location) {
      alert("Please fill name, event date, and location.");
      return;
    }
    if (channel === "sms" && !form.phone) {
      alert("Please add a phone number to send a text.");
      return;
    }
    if (channel === "email" && !form.email) {
      alert("Please add an email address.");
      return;
    }

    const payload = {
      channel,
      service,
      form,
      summary: { addOns: addOns.filter((a) => form.selectedAddOns.includes(a.id)) },
    };

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Request failed");
      alert(channel === "sms" ? "Request sent via text ✅" : "Request sent via email ✅");
      onClose();
    } catch (e) {
      console.error(e);
      alert("Could not send request. Try again.");
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Booking request"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Blocking backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Centered sheet */}
      <div
        ref={dialogRef}
        className="glass specular relative z-10 w-full max-w-3xl rounded-2xl shadow-xl"
        style={{ boxShadow: "0 24px 80px rgba(0,0,0,.40)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border/80 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Request Booking</p>
            <h3 className="truncate font-serif text-xl font-semibold" style={{ fontFamily: `"Playfair Display", ui-serif, Georgia, serif` }}>
              {service?.title || "General Inquiry"}
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg border border-border bg-card/70 px-2.5 py-1 text-sm hover:bg-accent/15"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="grid max-h-[85dvh] grid-cols-1 gap-0 overflow-y-auto md:grid-cols-2">
          {/* Left column — event details */}
          <div className="border-r border-border/70 px-5 py-4 md:py-5">
            <div className="rounded-xl border border-border/80 bg-card/60 p-3 backdrop-blur">
              <div className="grid gap-3">
                <label className="grid gap-1">
                  <span className="text-sm">Name</span>
                  <input
                    name="name"
                    className="rounded-lg border border-border bg-card/70 px-3 py-2"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Full name"
                  />
                </label>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-sm">Event date</span>
                    <input
                      type="date"
                      className="rounded-lg border border-border bg-card/70 px-3 py-2"
                      value={form.eventDate}
                      onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-sm">Party size</span>
                    <input
                      type="number"
                      min={1}
                      className="rounded-lg border border-border bg-card/70 px-3 py-2"
                      value={form.partySize}
                      onChange={(e) => setForm({ ...form, partySize: e.target.value })}
                      placeholder="e.g., 5"
                    />
                  </label>
                </div>

                <label className="grid gap-1">
                  <span className="text-sm">Location</span>
                  <input
                    className="rounded-lg border border-border bg-card/70 px-3 py-2"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Venue / Address"
                  />
                </label>
              </div>
            </div>

            {/* Add-ons */}
            {addOns.length > 0 && (
              <div className="mt-4">
                <span className="text-sm font-medium">Add-ons</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {addOns.map((a) => {
                    const checked = form.selectedAddOns.includes(a.id);
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => toggleAddOn(a.id)}
                        className={[
                          "rounded-xl border px-3 py-1.5 text-sm transition backdrop-blur",
                          checked
                            ? "bg-foreground/90 text-background border-border"
                            : "bg-card/70 hover:bg-accent/15 border-border",
                        ].join(" ")}
                      >
                        {a.label} {a.price ? `• ${a.price}` : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right column — contact + notes */}
          <div className="px-5 py-4 md:py-5">
            <fieldset className="rounded-xl border border-border/80 bg-card/60 p-3 backdrop-blur">
              <legend className="px-1 text-sm font-medium">Contact method</legend>
              <div className="mt-2 flex items-center gap-4">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="contactMethod"
                    checked={form.contactMethod === "sms"}
                    onChange={() => setForm({ ...form, contactMethod: "sms" })}
                  />
                  <span className="text-sm">Text (SMS)</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="contactMethod"
                    checked={form.contactMethod === "email"}
                    onChange={() => setForm({ ...form, contactMethod: "email" })}
                  />
                  <span className="text-sm">Email</span>
                </label>
              </div>

              <div className="mt-3">
                {form.contactMethod === "sms" ? (
                  <label className="grid gap-1">
                    <span className="text-sm">Phone number</span>
                    <input
                      inputMode="tel"
                      placeholder="+1 555 555 5555"
                      className="rounded-lg border border-border bg-card/70 px-3 py-2"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </label>
                ) : (
                  <label className="grid gap-1">
                    <span className="text-sm">Email</span>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="rounded-lg border border-border bg-card/70 px-3 py-2"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </label>
                )}
              </div>
            </fieldset>

            <label className="mt-4 block">
              <span className="text-sm">Notes</span>
              <textarea
                rows={5}
                className="mt-1 w-full rounded-lg border border-border bg-card/70 px-3 py-2"
                placeholder="Timeline, ready-by time, sensitivities…"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col gap-2 border-t border-border/80 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            onClick={() => submit("sms")}
            className="rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background shadow hover:bg-foreground/90"
          >
            Send via Text
          </button>
          <button
            onClick={() => submit("email")}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-accent"
          >
            Send via Email
          </button>
        </div>
      </div>
    </div>
  );
}
