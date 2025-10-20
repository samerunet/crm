"use client";

import { useState } from "react";
import clsx from "clsx";

type Service = { id: string; title: string } | undefined;
type AddOn = { id: string; label: string; price?: string };

export default function BookingModal({
  open,
  onClose,
  service,
  addOns = [],
}: {
  open: boolean;
  onClose: () => void;
  service?: Service;
  addOns?: AddOn[];
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [partySize, setPartySize] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [selAddOns, setSelAddOns] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<
    { type: "success" | "error"; msg: string } | null
  >(null);

  if (!open) return null;

  const toggleAddOn = (id: string) =>
    setSelAddOns((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );

  const smsBody =
    `Booking Inquiry%0A` +
    `Name: ${encodeURIComponent(name)}%0A` +
    (email ? `Email: ${encodeURIComponent(email)}%0A` : "") +
    (phone ? `Phone: ${encodeURIComponent(phone)}%0A` : "") +
    (service?.title ? `Service: ${encodeURIComponent(service.title)}%0A` : "") +
    (date ? `Date: ${encodeURIComponent(date)}%0A` : "") +
    (location ? `Location: ${encodeURIComponent(location)}%0A` : "") +
    (partySize ? `Party Size: ${encodeURIComponent(String(partySize))}%0A` : "") +
    (selAddOns.length
      ? `Add-ons: ${encodeURIComponent(selAddOns.join(", "))}%0A`
      : "") +
    (notes ? `%0ANotes: ${encodeURIComponent(notes)}` : "");

  async function submit() {
    setSubmitting(true);
    setDone(null);
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          service: service?.title,
          date,
          location,
          partySize,
          addOns: selAddOns,
          notes,
        }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Send failed");
      setDone({ type: "success", msg: "Sent! We’ll get back to you shortly." });
      setTimeout(onClose, 900);
    } catch (err: any) {
      setDone({ type: "error", msg: err?.message || "Send failed" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className={clsx(
          "relative w-full max-w-2xl rounded-2xl glass p-4 sm:p-6",
          "border border-border/70 shadow-[0_24px_70px_rgba(0,0,0,0.26)]",
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-semibold">Booking Request</h2>
          <button
            onClick={onClose}
            className="icon-chip h-9 w-9 inline-grid place-items-center rounded-xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm">Name *</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="crm-input"
              placeholder="Jane Doe"
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="crm-input"
              placeholder="jane@email.com"
              type="email"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm">Phone</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="crm-input"
              placeholder="(555) 555-5555"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm">Preferred Date</span>
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="crm-input"
              type="date"
            />
          </label>

          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-sm">Location</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="crm-input"
              placeholder="Venue / City"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm">Party Size</span>
            <input
              value={partySize}
              onChange={(e) => {
                const v = e.target.value;
                setPartySize(v === "" ? "" : Number(v));
              }}
              className="crm-input"
              type="number"
              min={1}
              placeholder="e.g., 6"
            />
          </label>

          <div className="sm:col-span-2">
            <span className="text-sm">Add-ons</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {addOns?.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleAddOn(a.id)}
                  className={clsx(
                    "crm-chip",
                    selAddOns.includes(a.id) && "bg-accent/20 border-accent",
                  )}
                >
                  {a.label}
                  {a.price ? ` — ${a.price}` : ""}
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1 sm:col-span-2">
            <span className="text-sm">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="crm-input min-h-[90px]"
              placeholder="Share any details, looks, or timing"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {service?.title ? (
              <>
                Selected service: <strong>{service.title}</strong>
              </>
            ) : (
              <>Choose a service and we’ll tailor a plan.</>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`sms:+16193996160?&body=${smsBody}`}
              className="inline-flex h-11 items-center justify-center rounded-full border border-border/70 bg-card/70 px-4 text-sm hover:bg-accent/20"
            >
              Text instead
            </a>

            <button
              disabled={submitting || !name}
              onClick={submit}
              className="gbtn rounded-full px-5 h-11 inline-flex items-center justify-center specular disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send request"}
            </button>
          </div>
        </div>

        {done && (
          <p
            className={clsx(
              "mt-3 text-sm",
              done.type === "success" ? "text-emerald-600" : "text-destructive",
            )}
          >
            {done.msg}
          </p>
        )}
      </div>
    </div>
  );
}
