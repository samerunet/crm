'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

export type Service = { id: string; title: string } | undefined;

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

  const [name, setName] = useState('');
  const [occasion, setOccasion] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [servicesCount, setServicesCount] = useState('');

  const [date, setDate] = useState('');
  const [eventTime, setEventTime] = useState('');

  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<null | { ok: boolean; message: string }>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) setTimeout(() => dialogRef.current?.focus(), 0);
  }, [open]);

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const maxDateISO = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2);
    return d.toISOString().slice(0, 10);
  }, []);

  const TIME_LABELS = useMemo(() => {
    const labels: string[] = [];
    for (let h = 5; h <= 19; h++) {
      const hour12 = ((h + 11) % 12) + 1;
      const ampm = h < 12 ? 'AM' : 'PM';
      labels.push(`${hour12}:00 ${ampm}`);
    }
    return labels;
  }, []);

  const serviceHint = (service?.title || '').trim();

  const servicesCountNum = useMemo(() => {
    const n = parseInt(String(servicesCount).replace(/[^\d]/g, ''), 10);
    if (!Number.isFinite(n) || n < 1) return 0;
    return Math.min(n, 15);
  }, [servicesCount]);

  function hasContact() {
    return !!(phone.trim() || email.trim());
  }

  function minValid() {
    return !!(
      name.trim() &&
      hasContact() &&
      occasion.trim() &&
      servicesCountNum >= 1 &&
      location.trim() &&
      date
    );
  }

  function nextMissingFieldId(): string | null {
    if (!name.trim()) return 'field-name';
    if (!hasContact()) return 'field-phone';
    if (!occasion.trim()) return 'field-occasion';
    if (!(servicesCountNum >= 1)) return 'field-services-count';
    if (!location.trim()) return 'field-location';
    if (!date) return 'field-date';
    return null;
  }

  const smsBody = useMemo(() => {
    const lines = [
      'Booking Inquiry',
      name ? `Name: ${name}` : '',
      occasion ? `Occasion: ${occasion}` : '',
      phone ? `Phone: ${phone}` : '',
      email ? `Email: ${email}` : '',
      servicesCountNum ? `# Services: ${servicesCountNum}` : '',
      serviceHint ? `Requested: ${serviceHint}` : '',
      date ? `Event date: ${date}` : '',
      eventTime ? `Event time: ${eventTime}` : '',
      location ? `Location: ${location}` : '',
      notes ? `Notes: ${notes}` : '',
    ].filter(Boolean);
    return encodeURIComponent(lines.join('\n'));
  }, [
    name,
    occasion,
    phone,
    email,
    servicesCountNum,
    serviceHint,
    date,
    eventTime,
    location,
    notes,
  ]);

  async function submit() {
    if (!minValid()) {
      const id = nextMissingFieldId();
      if (id) document.getElementById(id)?.focus();
      return;
    }

    setSubmitting(true);
    setResult(null);

    const fallbackMessage = [
      `Booking inquiry`,
      occasion.trim() ? `Occasion: ${occasion.trim()}` : '',
      `${servicesCountNum} service(s)`,
      serviceHint ? `Requested: ${serviceHint}` : '',
      date ? `Event date: ${date}` : '',
      eventTime ? `Event time: ${eventTime}` : '',
      location ? `Location: ${location}` : '',
      notes.trim() ? `Notes: ${notes.trim()}` : '',
    ]
      .filter(Boolean)
      .join(' • ');

    try {
      const payload = {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        occasion: occasion.trim() || undefined,
        servicesCount: servicesCountNum,
        service: serviceHint || undefined,
        eventDate: date,
        date: date,
        time: eventTime.trim() || undefined,
        location: location.trim(),
        notes: notes.trim() || undefined,
        message: fallbackMessage,
        source: 'website',
        partySize: servicesCountNum,
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
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1 opacity-70"
          style={{
            background:
              'radial-gradient(140% 70% at 50% -10%, rgba(203,185,164,0.18), transparent 55%)',
          }}
        />

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

        <div className="relative z-10 mt-3 max-h-[62vh] overflow-y-auto px-4 pb-28 sm:px-6 sm:pb-24">
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
                label="Phone *"
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
                label="Email *"
                value={email}
                onChange={setEmail}
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                enterKeyHint="next"
              />

              <FloatingInput
                id="field-occasion"
                label="Occasion *"
                value={occasion}
                onChange={setOccasion}
                name="occasion"
                autoComplete="on"
                inputMode="text"
                enterKeyHint="next"
                required
              />
              <FloatingInput
                id="field-services-count"
                label="Number of services *"
                value={servicesCount}
                onChange={setServicesCount}
                name="services-count"
                autoComplete="off"
                inputMode="text"
                enterKeyHint="next"
                required
              />

              <div className="sm:col-span-2">
                <FloatingInput
                  id="field-location"
                  label="Location / Address *"
                  value={location}
                  onChange={setLocation}
                  name="street-address"
                  autoComplete="street-address"
                  inputMode="text"
                  enterKeyHint="next"
                  required
                />
              </div>

              <FloatingInput
                id="field-date"
                label="Event date *"
                value={date}
                onChange={setDate}
                type="date"
                name="event-date"
                min={todayISO}
                max={maxDateISO}
                required
              />

              <FloatingSelect
                id="field-time"
                label="Time (optional)"
                value={eventTime}
                onChange={setEventTime}
                options={['', ...TIME_LABELS] as unknown as readonly string[]}
              />
            </div>
          </section>

          <div className="mt-6 mb-2 text-[11px] tracking-wide text-white/60 uppercase">
            Optional
          </div>

          <section className="rounded-2xl border border-white/25 bg-white/[0.12] p-3 sm:p-4">
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
  value: any;
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
        <option value="" hidden={required}>
          {''}
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
