'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

export type Service = { id: string; title: string } | undefined;
export type AddOn = { id: string; label: string; price?: string };

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
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceSelect, setServiceSelect] = useState<ServiceOption | ''>('');
  const [otherService, setOtherService] = useState('');

  const [date, setDate] = useState('');
  const [eventTime, setEventTime] = useState(''); // hour-only text (e.g., "6:00 AM")
  const [partySize, setPartySize] = useState<number>(1);
  const [location, setLocation] = useState('');
  const [selAddOns, setSelAddOns] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  // ux
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<null | { ok: boolean; message: string }>(null);

  // lifecycles
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) setTimeout(() => dialogRef.current?.focus(), 0);
  }, [open]);

  // prefill from opener
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

  // bounds
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const maxDateISO = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2);
    return d.toISOString().slice(0, 10);
  }, []);

  // hour-only dropdown labels (5 AM – 7 PM)
  const TIME_LABELS = useMemo(() => {
    const labels: string[] = [];
    for (let h = 5; h <= 19; h++) {
      const hour12 = ((h + 11) % 12) + 1;
      const ampm = h < 12 ? 'AM' : 'PM';
      labels.push(`${hour12}:00 ${ampm}`);
    }
    return labels;
  }, []);

  // quick helpers
  const chosenServiceTitle =
    (serviceSelect === 'Other' ? otherService.trim() : serviceSelect) || '';
  function toggleAddOn(id: string) {
    setSelAddOns((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }
  // hide any airbrush add-ons
  const filteredAddOns = useMemo(() => addOns.filter((a) => !/airbrush/i.test(a.label)), [addOns]);

  // ---------- validation tuned for speed ----------
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

  function softErrors(): string[] {
    const errs: string[] = [];
    if (date && (date < todayISO || date > maxDateISO)) errs.push('date');
    if (!(partySize >= 1 && partySize <= 15)) errs.push('party');
    return errs;
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
      location ? `Location: ${location}` : '',
      partySize ? `Party Size: ${partySize}` : '',
      selAddOns.length ? `Add-ons: ${selAddOns.join(', ')}` : '',
      notes ? `Notes: ${notes}` : '',
    ].filter(Boolean);
    return encodeURIComponent(lines.join('\n'));
  }, [
    name,
    email,
    phone,
    chosenServiceTitle,
    date,
    eventTime,
    location,
    partySize,
    selAddOns,
    notes,
  ]);

  async function submit() {
    const fallbackMessage =
      notes.trim() ||
      [
        `Quick booking for ${chosenServiceTitle || 'Service'}`,
        date && `on ${date}`,
        eventTime && `at ${eventTime}`,
        location && `in ${location}`,
        `party ${partySize}`,
      ]
        .filter(Boolean)
        .join(' • ');

    if (!minValid()) {
      const id = nextMissingFieldId();
      if (id) document.getElementById(id)?.focus();
      return;
    }
    if (softErrors().length) return;

    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          service: chosenServiceTitle || undefined,
          date: date || undefined,
          location: location.trim() || undefined,
          time: eventTime.trim() || undefined,
          partySize,
          addOns: selAddOns,
          notes: notes.trim() || undefined,
          message: fallbackMessage,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) throw new Error(json?.error || 'Send failed');
      setResult({ ok: true, message: "Sent! We'll get back to you shortly." });
      setTimeout(onClose, 900);
    } catch (err: any) {
      setResult({ ok: false, message: err?.message || 'Send failed' });
    } finally {
      setSubmitting(false);
    }
  }

  // quick date helpers
  function setDateTo(offsetDays: number) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setDate(d.toISOString().slice(0, 10));
  }
  function setNextWeekend(dayIndex: 6 | 0) {
    const now = new Date();
    const diff = (dayIndex - now.getDay() + 7) % 7 || 7;
    setDateTo(diff);
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

        {/* Single-screen form */}
        <div className="relative z-10 mt-3 max-h-[62vh] overflow-y-auto px-4 pb-28 sm:px-6 sm:pb-24">
          {/* REQUIRED */}
          <div className="mb-2 text-[11px] tracking-wide text-white/60 uppercase">Required</div>
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

            {/* Service quick chips */}
            <div className="sm:col-span-2">
              <div className="flex flex-wrap gap-2">
                {(SERVICE_OPTIONS as readonly string[])
                  .filter((s) => s !== 'Other') // no airbrush in options; "Other" still available
                  .map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setServiceSelect(s as ServiceOption);
                        setOtherService('');
                      }}
                      className={clsx(
                        'rounded-full border px-3 py-1.5 text-sm',
                        serviceSelect === s
                          ? 'border-white/30 bg-white/15 text-white'
                          : 'border-white/12 text-white/80 hover:bg-white/10',
                      )}
                      aria-pressed={serviceSelect === s}
                    >
                      {s}
                    </button>
                  ))}
                <button
                  type="button"
                  onClick={() => setServiceSelect('Other')}
                  className={clsx(
                    'rounded-full border px-3 py-1.5 text-sm',
                    serviceSelect === 'Other'
                      ? 'border-white/30 bg-white/15 text-white'
                      : 'border-white/12 text-white/80 hover:bg-white/10',
                  )}
                  aria-pressed={serviceSelect === 'Other'}
                >
                  Other
                </button>
              </div>

              <div className="mt-3">
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
              </div>

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
          </section>

          {/* RECOMMENDED */}
          <div className="mt-6 mb-2 text-[11px] tracking-wide text-white/60 uppercase">
            Recommended
          </div>
          <section className="grid gap-4">
            {/* Date + hour dropdown */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="field-date" className="text-sm text-white/80">
                    Preferred date
                  </label>
                  <div className="flex gap-1.5">
                    <QuickChip onClick={() => setDateTo(0)}>Today</QuickChip>
                    <QuickChip onClick={() => setDateTo(1)}>Tomorrow</QuickChip>
                    <QuickChip onClick={() => setNextWeekend(6)}>Sat</QuickChip>
                    <QuickChip onClick={() => setNextWeekend(0)}>Sun</QuickChip>
                  </div>
                </div>
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
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="field-time" className="text-sm text-white/80">
                    Time of the event
                  </label>
                </div>
                <FloatingSelect
                  id="field-time"
                  label="Time of the event"
                  value={eventTime}
                  onChange={setEventTime}
                  options={['', ...TIME_LABELS] as unknown as readonly string[]}
                />
              </div>
            </div>

            {/* Party size + Location */}
            <div
              id="field-party"
              className="rounded-2xl border border-white/12 bg-white/[0.04] p-3"
            >
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/80">Party size (1–15)</label>
                <span className="text-[11px] text-white/60">Selected: {partySize}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[1, 2, 3, 4, 5, 6, 8, 10, 12, 15].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPartySize(n)}
                    className={clsx(
                      'h-8 rounded-full border px-3 text-xs',
                      partySize === n
                        ? 'border-white/30 bg-white/15 text-white'
                        : 'border-white/12 text-white/80 hover:bg-white/10',
                    )}
                    aria-pressed={partySize === n}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <FloatingInput
              label="Location"
              value={location}
              onChange={setLocation}
              name="street-address"
              autoComplete="street-address"
              inputMode="text"
            />

            {/* Add-ons (airbrush removed) */}
            {filteredAddOns.length ? (
              <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-3">
                <label className="text-sm text-white/80">Add-ons</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {filteredAddOns.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleAddOn(a.id)}
                      className={clsx(
                        'rounded-full border px-3 py-1 text-sm',
                        selAddOns.includes(a.id)
                          ? 'border-white/30 bg-white/15 text-white'
                          : 'border-white/12 text-white/80 hover:bg-white/10',
                      )}
                      aria-pressed={selAddOns.includes(a.id)}
                    >
                      {a.label}
                      {a.price ? ` — ${a.price}` : ''}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

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

/* ---------- primitives ---------- */

function QuickChip(props: React.HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className={clsx(
        'h-7 rounded-full border px-2.5 text-xs text-white/80',
        'border-white/12 hover:bg-white/10',
        props.className,
      )}
    />
  );
}

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
  value: string;
  onChange: (v: string) => void;
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
        {/* allow empty for optional selects like time */}
        <option value="" hidden={required}>
          Select a service
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
