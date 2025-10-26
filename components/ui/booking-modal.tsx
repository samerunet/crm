'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

export type Service = { id: string; title: string } | undefined;

const SERVICE_OPTIONS = [
  'Bridal Makeup',
  'Bridal Party Makeup',
  'Special Occasion Makeup',
  'Editorial & Brand Work',
  'Studio Appointments',
  'Destination Weddings',
  'Other',
] as const;

type ServiceOption = (typeof SERVICE_OPTIONS)[number];

const LOCATION_OPTIONS = [
  'Studio Appointment', // default
  'On-site / Mobile',
  'Venue / Hotel',
  'Other (enter address)',
] as const;

export default function BookingModal({
  open,
  onClose,
  service,
}: {
  open: boolean;
  onClose: () => void;
  service?: Service;
}) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // ---------- form state ----------
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [serviceSelect, setServiceSelect] = useState<ServiceOption | ''>('');
  const [otherService, setOtherService] = useState('');

  const [date, setDate] = useState(''); // YYYY-MM-DD
  const [eventTime, setEventTime] = useState(''); // e.g., "6:00 AM"

  const [partySize, setPartySize] = useState<number>(1);

  // Location as dropdown (default: Studio Appointment)
  const [locationChoice, setLocationChoice] =
    useState<(typeof LOCATION_OPTIONS)[number]>('Studio Appointment');
  const [locationCustom, setLocationCustom] = useState('');

  const [notes, setNotes] = useState('');

  // UX
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<null | { ok: boolean; message: string }>(null);

  // ---------- lifecycles ----------
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) setTimeout(() => dialogRef.current?.focus(), 0);
  }, [open]);

  // prefill from opener (if “Book” clicked on a service)
  useEffect(() => {
    if (!open || !service?.title) return;
    const title = service.title.trim();
    const hit = SERVICE_OPTIONS.find(
      (s) => s !== 'Other' && s.toLowerCase() === title.toLowerCase(),
    );
    if (hit) {
      setServiceSelect(hit);
      setOtherService('');
    } else {
      setServiceSelect('Other');
      setOtherService(title);
    }
  }, [open, service?.title]);

  // ---------- bounds ----------
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const maxDateISO = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2);
    return d.toISOString().slice(0, 10);
  }, []);

  // hour-only dropdown (5 AM – 7 PM)
  const TIME_LABELS = useMemo(() => {
    const labels: string[] = [];
    for (let h = 5; h <= 19; h++) {
      const hour12 = ((h + 11) % 12) + 1;
      const ampm = h < 12 ? 'AM' : 'PM';
      labels.push(`${hour12}:00 ${ampm}`);
    }
    return labels;
  }, []);

  // ---------- helpers ----------
  const chosenServiceTitle =
    (serviceSelect === 'Other' ? otherService.trim() : serviceSelect) || '';

  const locationString =
    locationChoice === 'Other (enter address)' ? locationCustom.trim() || 'Other' : locationChoice;

  function hasContact() {
    return !!(phone.trim() || email.trim());
  }
  function minValid() {
    return !!(name.trim() && chosenServiceTitle && hasContact());
  }
  function nextMissingFieldId(): string | null {
    if (!name.trim()) return 'field-name';
    if (!hasContact()) return phone.trim() ? 'field-email' : 'field-phone';
    if (!chosenServiceTitle) return 'field-service';
    return null;
  }

  const smsBody = useMemo(() => {
    const lines = [
      'Booking Inquiry',
      name ? `Name: ${name}` : '',
      email ? `Email: ${email}` : '',
      phone ? `Phone: ${phone}` : '',
      chosenServiceTitle ? `Service: ${chosenServiceTitle}` : '',
      date ? `Date: ${date}` : '',
      eventTime ? `Time: ${eventTime}` : '',
      locationString ? `Location: ${locationString}` : '',
      partySize ? `Party Size: ${partySize}` : '',
      notes ? `Notes: ${notes}` : '',
    ].filter(Boolean);
    return encodeURIComponent(lines.join('\n'));
  }, [name, email, phone, chosenServiceTitle, date, eventTime, locationString, partySize, notes]);

  async function submit() {
    // Fallback message for CRMs that expect a message body
    const fallbackMessage =
      notes.trim() ||
      [
        `Quick booking for ${chosenServiceTitle || 'Service'}`,
        date && `on ${date}`,
        eventTime && `at ${eventTime}`,
        locationString && `in ${locationString}`,
        `party ${partySize}`,
      ]
        .filter(Boolean)
        .join(' • ');

    if (!minValid()) {
      const id = nextMissingFieldId();
      if (id) document.getElementById(id)?.focus();
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      // Build payload to align with your Lead schema
      // NOTE: We send *both* `eventDate` and `date` for compatibility.
      const payload = {
        name: name.trim(), // Lead.name (String?) — we send it
        email: email.trim() || undefined, // Lead.email (String? in updated schema)
        phone: phone.trim() || undefined, // Lead.phone (String?)
        service: chosenServiceTitle || undefined, // Lead.service (String?)
        eventDate: date || undefined, // Lead.eventDate (DateTime?) — server can parse
        date: date || undefined, // compat if your handler still maps `date` -> eventDate
        time: eventTime.trim() || undefined, // Lead.time (String?)
        partySize: Number.isFinite(partySize) ? partySize : 1, // Lead.partySize (Int?)
        location: locationString || undefined, // Lead.location (String?)
        addOns: [], // Lead.addOns (Json?) — keep array for older handlers
        notes: notes.trim() || undefined, // Lead.notes (String?)
        message: fallbackMessage, // Lead.message (String?)
        source: 'website', // Lead.source (String?)
      };

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });

      // Show real backend error text if not JSON
      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { ok: res.ok, message: text || (res.ok ? 'OK' : 'Failed') };
      }

      if (!res.ok || data?.ok === false) {
        throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
      }

      setResult({ ok: true, message: data?.message || "Sent! We'll get back to you shortly." });
      setTimeout(onClose, 900);
    } catch (err: any) {
      console.error('Booking submit error:', err);
      setResult({ ok: false, message: err?.message || 'Send failed' });
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={clsx(
          'relative w-full overflow-hidden rounded-t-2xl sm:max-w-2xl sm:rounded-2xl',
          'border border-white/15 bg-[rgb(18,13,10)]/92 shadow-[0_24px_70px_rgba(0,0,0,0.38)] backdrop-blur-xl',
          'animate-[slideUp_.18s_ease-out]',
        )}
        style={{ maxHeight: 'min(92vh, 760px)' }}
      >
        {/* subtle glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1 opacity-70"
          style={{
            background:
              'radial-gradient(140% 70% at 50% -10%, rgba(203,185,164,0.18), transparent 55%)',
          }}
        />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-5">
          <h2 className="text-lg leading-tight font-semibold text-white">Booking Request</h2>
          <button
            onClick={onClose}
            className="inline-grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-white/5 text-white/90 hover:bg-white/10"
            aria-label="Close"
            type="button"
          >
            ×
          </button>
        </div>

        {/* Form (boxes are ~5 shades lighter now) */}
        <div className="relative z-10 mt-3 max-h-[62vh] overflow-y-auto px-4 pb-28 sm:px-6 sm:pb-24">
          {/* REQUIRED */}
          <div className="mb-2 text-[11px] tracking-wide text-white/60 uppercase">Required</div>
          <section className="rounded-2xl border border-white/25 bg-white/[0.12] p-3 sm:p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FloatingInput
                id="field-name"
                label="Name *"
                value={name}
                onChange={setName}
                name="name"
                autoComplete="name"
                inputMode="text"
                enterKeyHint="next"
                required
              />
              <FloatingInput
                id="field-phone"
                label="Phone"
                value={phone}
                onChange={setPhone}
                type="tel"
                name="tel"
                autoComplete="tel"
                inputMode="tel"
                enterKeyHint="next"
              />
              <FloatingInput
                id="field-email"
                label="Email"
                value={email}
                onChange={setEmail}
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                enterKeyHint="next"
              />

              <div className="sm:col-span-2">
                <FloatingSelect
                  id="field-service"
                  label="Service *"
                  value={serviceSelect}
                  onChange={(v) => {
                    setServiceSelect(v as ServiceOption);
                    if (v !== 'Other') setOtherService('');
                  }}
                  options={SERVICE_OPTIONS}
                  required
                />
                {serviceSelect === 'Other' && (
                  <div className="mt-3">
                    <FloatingInput
                      id="field-otherService"
                      label="Describe the service *"
                      value={otherService}
                      onChange={setOtherService}
                      name="service-other"
                      autoComplete="on"
                      enterKeyHint="next"
                      required
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* RECOMMENDED 1: Date & Time */}
          <div className="mt-6 mb-2 text-[11px] tracking-wide text-white/60 uppercase">
            Recommended
          </div>
          <section className="rounded-2xl border border-white/25 bg-white/[0.12] p-3 sm:p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FloatingInput
                id="field-date"
                label="Preferred date"
                value={date}
                onChange={setDate}
                type="date"
                name="event-date"
                min={todayISO}
                max={maxDateISO}
              />
              <FloatingSelect
                id="field-time"
                label="Time of the event"
                value={eventTime}
                onChange={setEventTime}
                options={['', ...TIME_LABELS] as unknown as readonly string[]}
              />
            </div>
          </section>

          {/* RECOMMENDED 2: Party size & Location */}
          <section className="mt-4 rounded-2xl border border-white/25 bg-white/[0.12] p-3 sm:p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FloatingSelect
                id="field-party"
                label="Party size (1–15)"
                value={String(partySize)}
                onChange={(v) =>
                  setPartySize(Math.max(1, Math.min(15, parseInt(String(v || '1'), 10) || 1)))
                }
                options={
                  Array.from({ length: 15 }, (_, i) =>
                    String(i + 1),
                  ) as unknown as readonly string[]
                }
              />
              <div>
                <FloatingSelect
                  id="field-location"
                  label="Location"
                  value={locationChoice}
                  onChange={(v) => setLocationChoice(v as (typeof LOCATION_OPTIONS)[number])}
                  options={LOCATION_OPTIONS}
                />
                {locationChoice === 'Other (enter address)' && (
                  <div className="mt-3">
                    <FloatingInput
                      id="field-location-custom"
                      label="Enter address"
                      value={locationCustom}
                      onChange={setLocationCustom}
                      name="street-address"
                      autoComplete="street-address"
                      inputMode="text"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* RECOMMENDED 3: Notes */}
          <section className="mt-4 rounded-2xl border border-white/25 bg-white/[0.12] p-3 sm:p-4">
            <FloatingTextArea
              id="field-notes"
              label="Notes"
              value={notes}
              onChange={setNotes}
              placeholder="Share any details, looks, or timing"
              autoComplete="on"
              rows={3}
            />
          </section>
        </div>

        {/* Sticky footer */}
        <div className="pointer-events-auto relative z-10 border-t border-white/12 bg-[rgb(18,13,10)]/94 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <a
              href={`sms:+16193996160?&body=${smsBody}`}
              className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 text-sm text-white/90 hover:bg-white/10"
            >
              Text instead
            </a>

            <button
              className="inline-flex h-11 min-w-[130px] items-center justify-center rounded-full px-5 text-sm font-medium text-[rgb(18,13,10)] shadow transition-transform hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: 'linear-gradient(180deg, rgba(203,185,164,1), rgba(156,127,99,1))',
                boxShadow: '0 16px 40px rgba(0,0,0,.28)',
              }}
              onClick={() =>
                minValid() ? submit() : document.getElementById(nextMissingFieldId() || '')?.focus()
              }
              disabled={submitting}
              type="button"
            >
              {submitting ? 'Sending…' : minValid() ? 'Send inquiry' : 'Next'}
            </button>
          </div>

          <div aria-live="polite" className="mt-2 min-h-[20px] text-center text-sm">
            {result && (
              <span className={clsx(result.ok ? 'text-emerald-400' : 'text-red-400')}>
                {result.message}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* micro-animations + autofill fixes */}
      <style jsx global>{`
        @keyframes slideUp {
          from {
            transform: translateY(12px);
            opacity: 0.98;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        input[type='number'] {
          -moz-appearance: number-input;
        }
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
          -webkit-appearance: inner-spin-button;
          height: auto;
          display: block;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        textarea:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px rgba(18, 13, 10, 0.92) inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff !important;
        }
      `}</style>
    </div>
  );
}

/* ---------- inputs ---------- */

function FloatingInput({
  id,
  label,
  value,
  onChange,
  type = 'text',
  name,
  autoComplete,
  inputMode,
  min,
  max,
  enterKeyHint,
  required,
  readOnly,
  error,
}: {
  id?: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  name?: string;
  autoComplete?: string;
  inputMode?: 'text' | 'email' | 'tel' | 'numeric';
  min?: string;
  max?: string;
  enterKeyHint?: 'next' | 'done';
  required?: boolean;
  readOnly?: boolean;
  error?: string;
}) {
  const describedBy = error ? `${id || name}-error` : undefined;
  return (
    <div className="group relative">
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={clsx(
          'peer h-12 w-full rounded-xl border px-3 pt-[18px] text-white/95 transition outline-none',
          'border-white/15 bg-white/[0.06] placeholder-transparent focus:border-white/30 focus:bg-white/[0.1]',
          error && 'border-red-400/60 focus:border-red-400/80',
        )}
        placeholder=" "
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={type}
        name={name}
        autoComplete={autoComplete}
        inputMode={inputMode}
        min={min}
        max={max}
        enterKeyHint={enterKeyHint}
        required={required}
        readOnly={readOnly}
      />
      <label
        htmlFor={id}
        className={clsx(
          'pointer-events-none absolute top-1.5 left-3 text-[11px] tracking-wide text-white/70 transition-all',
          'peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-white/60',
          'peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-white/80',
        )}
      >
        {label}
      </label>
      {error ? (
        <p id={describedBy} className="mt-1 pl-1 text-[11px] text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function FloatingTextArea({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  autoComplete,
  enterKeyHint,
  required,
  error,
}: {
  id?: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  autoComplete?: string;
  enterKeyHint?: 'next' | 'done';
  required?: boolean;
  error?: string;
}) {
  const describedBy = error ? `${id}-error` : undefined;
  return (
    <div className="group relative">
      <textarea
        id={id}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={clsx(
          'peer w-full rounded-xl border px-3 pt-[20px] text-white/95 transition outline-none',
          'border-white/15 bg-white/[0.06] placeholder-transparent focus:border-white/30 focus:bg-white/[0.1]',
          error && 'border-red-400/60 focus:border-red-400/80',
        )}
        placeholder=" "
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        enterKeyHint={enterKeyHint}
      />
      <label
        className={clsx(
          'pointer-events-none absolute top-1.5 left-3 text-[11px] tracking-wide text-white/70 transition-all',
          'peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-white/60',
          'peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-white/80',
        )}
      >
        {label}
      </label>
      {placeholder ? <div className="mt-1 pl-1 text-xs text-white/50">{placeholder}</div> : null}
      {error ? (
        <p id={describedBy} className="mt-1 pl-1 text-[11px] text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function FloatingSelect({
  id,
  label,
  value,
  onChange,
  options,
  required,
  error,
}: {
  id?: string;
  label: string;
  value: any; // allow number|string safely
  onChange: (v: any) => void;
  options: readonly string[];
  required?: boolean;
  error?: string;
}) {
  const describedBy = error ? `${id}-error` : undefined;
  return (
    <div className="group relative">
      <select
        id={id}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={clsx(
          'peer h-12 w-full appearance-none rounded-xl border px-3 pt-[18px] text-white/95 transition outline-none',
          'border-white/15 bg-white/[0.06] focus:border-white/30 focus:bg-white/[0.1]',
          error && 'border-red-400/60 focus:border-red-400/80',
        )}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {/* Allow empty for optional selects (e.g., time) */}
        <option value="" hidden={required}>
          {id === 'field-service' ? 'Select a service' : ''}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <label
        htmlFor={id}
        className={clsx(
          'pointer-events-none absolute top-1.5 left-3 text-[11px] tracking-wide text-white/70 transition-all',
          'peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:text-white/80',
          value ? 'top-1.5 text-[11px] text-white/80' : 'top-3 text-sm text-white/60',
        )}
      >
        {label}
      </label>
      {error ? (
        <p id={describedBy} className="mt-1 pl-1 text-[11px] text-red-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
