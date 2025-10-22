'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

export type Service = { id: string; title: string } | undefined;
export type AddOn = { id: string; label: string; price?: string };

// Keep in sync with your Services page
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
  const stepWrapRef = useRef<HTMLDivElement | null>(null);

  // steps: 0 contact+service, 1 event, 2 options, 3 review
  const [step, setStep] = useState(0);

  // form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // service selection
  const [serviceSelect, setServiceSelect] = useState<ServiceOption | ''>('');
  const [otherService, setOtherService] = useState('');

  // event
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [partySize, setPartySize] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [selAddOns, setSelAddOns] = useState<string[]>([]);

  // ux
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<null | { ok: boolean; message: string }>(null);

  // ===== lifecycles =====
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // focus trap anchor
  useEffect(() => {
    if (open) setTimeout(() => dialogRef.current?.focus(), 0);
  }, [open]);

  // autofocus first field per step
  useEffect(() => {
    const wrap = stepWrapRef.current;
    if (!wrap) return;
    const el = wrap.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      'input:not([readonly]), textarea, select',
    );
    el?.focus({ preventScroll: true });
  }, [step]);

  // init selected service from opener (if passed)
  useEffect(() => {
    if (!open) return;
    if (!service?.title) return;
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

  // date bounds (today.. +2y)
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const maxDateISO = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2); // <= 2 years
    return d.toISOString().slice(0, 10);
  }, []);

  // progress
  const steps = [
    { key: 'contact', title: 'Your details' },
    { key: 'event', title: 'Event info' },
    { key: 'options', title: 'Options' },
    { key: 'review', title: 'Review & send' },
  ] as const;
  const progress = ((step + 1) / steps.length) * 100;

  // ===== validation =====
  type Errors = Partial<Record<'name' | 'service' | 'otherService' | 'date' | 'partySize', string>>;

  function validateStep(currentStep = step): Errors {
    const errs: Errors = {};
    if (currentStep === 0) {
      if (!name.trim()) errs.name = 'Your name is required.';
      if (!serviceSelect) errs.service = 'Please pick a service.';
      if (serviceSelect === 'Other' && !otherService.trim()) {
        errs.otherService = 'Please describe the service.';
      }
    }
    if (currentStep === 1) {
      // date optional but if present must be within bounds
      if (date) {
        if (date < todayISO) errs.date = 'Date cannot be in the past.';
        if (date > maxDateISO) errs.date = 'Please pick a date within 2 years.';
      }
      if (!(partySize >= 1 && partySize <= 15)) {
        errs.partySize = 'Party size must be between 1 and 15.';
      }
    }
    return errs;
  }

  const errors = useMemo(
    () => validateStep(step),
    [step, name, serviceSelect, otherService, date, partySize],
  );

  function goNext() {
    const errs = validateStep(step);
    if (Object.keys(errs).length) {
      // scroll to first error
      const id =
        (step === 0 &&
          (errs.name ? 'field-name' : errs.service ? 'field-service' : 'field-otherService')) ||
        (step === 1 && (errs.date ? 'field-date' : 'field-party')) ||
        '';
      if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setStep((s) => Math.min(3, s + 1));
  }

  // helpers
  const quickParty = [1, 2, 3, 4, 5, 6, 8, 10, 12, 15];

  function toggleAddOn(id: string) {
    setSelAddOns((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }

  const chosenServiceTitle = serviceSelect === 'Other' ? otherService.trim() : serviceSelect;

  const smsBody = useMemo(() => {
    const lines = [
      'Booking Inquiry',
      name ? `Name: ${name}` : '',
      email ? `Email: ${email}` : '',
      phone ? `Phone: ${phone}` : '',
      chosenServiceTitle ? `Service: ${chosenServiceTitle}` : '',
      date ? `Date: ${date}` : '',
      location ? `Location: ${location}` : '',
      partySize ? `Party Size: ${partySize}` : '',
      selAddOns.length ? `Add-ons: ${selAddOns.join(', ')}` : '',
      notes ? `Notes: ${notes}` : '',
    ].filter(Boolean);
    return encodeURIComponent(lines.join('\n'));
  }, [name, email, phone, chosenServiceTitle, date, location, partySize, selAddOns, notes]);

  async function submit() {
    // final guard
    const allErrs = { ...validateStep(0), ...validateStep(1) };
    if (Object.keys(allErrs).length) {
      setStep(0);
      return;
    }
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
          partySize,
          addOns: selAddOns,
          notes: notes.trim() || undefined,
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />

      {/* Bottom Sheet / Modal */}
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
          <div>
            <h2 className="text-lg leading-tight font-semibold text-white">Booking Request</h2>
            <p className="text-xs text-white/70">{steps[step].title}</p>
          </div>
          <button
            onClick={onClose}
            className="inline-grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-white/5 text-white/90 hover:bg-white/10"
            aria-label="Close"
            type="button"
          >
            ×
          </button>
        </div>

        {/* Progress */}
        <div className="relative z-10 px-4 sm:px-6">
          <div className="mt-3 h-[6px] overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, rgba(203,185,164,.9), rgba(156,127,99,.9))',
              }}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {steps.map((s, i) => (
              <span
                key={s.key}
                className={clsx(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] tracking-wide',
                  i === step ? 'bg-white/15 text-white' : 'border border-white/15 text-white/70',
                )}
              >
                {s.title}
              </span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div
          ref={stepWrapRef}
          className="relative z-10 mt-3 max-h-[58vh] overflow-y-auto px-4 pb-28 sm:max-h-[62vh] sm:px-6 sm:pb-24"
        >
          {/* Step 0: Contact + Service */}
          {step === 0 && (
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
                error={errors.name}
              />
              <FloatingInput
                label="Email"
                value={email}
                onChange={setEmail}
                type="email"
                name="email"
                autoComplete="email"
                inputMode="email"
                enterKeyHint="next"
              />
              <FloatingInput
                label="Phone"
                value={phone}
                onChange={setPhone}
                type="tel"
                name="tel"
                autoComplete="tel"
                inputMode="tel"
                enterKeyHint="next"
              />

              {/* Service dropdown */}
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
                error={errors.service}
              />

              {/* Other service (conditional) */}
              {serviceSelect === 'Other' && (
                <FloatingInput
                  id="field-otherService"
                  label="Describe the service *"
                  value={otherService}
                  onChange={setOtherService}
                  name="service-other"
                  autoComplete="on"
                  enterKeyHint="next"
                  required
                  error={errors.otherService}
                />
              )}
            </section>
          )}

          {/* Step 1: Event */}
          {step === 1 && (
            <section className="grid grid-cols-1 gap-4">
              <FloatingInput
                id="field-date"
                label="Preferred date"
                value={date}
                onChange={setDate}
                type="date"
                name="event-date"
                min={todayISO}
                max={maxDateISO}
                enterKeyHint="next"
                error={errors.date}
              />

              {/* Party size */}
              <div
                id="field-party"
                className="rounded-2xl border border-white/12 bg-white/[0.04] p-3"
              >
                <div className="flex items-center justify-between">
                  <label className="text-sm text-white/80">Party size (1–15)</label>
                  {errors.partySize ? (
                    <span className="text-[11px] text-red-300">{errors.partySize}</span>
                  ) : (
                    <span className="text-[11px] text-white/60">Selected: {partySize}</span>
                  )}
                </div>

                {/* Quick chips */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {quickParty.map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPartySize(n)}
                      className={clsx(
                        'h-8 rounded-full border px-3 text-xs transition-colors',
                        partySize === n
                          ? 'border-white/30 bg-white/15 text-white'
                          : 'border-white/12 bg-transparent text-white/80 hover:bg-white/10',
                      )}
                      aria-pressed={partySize === n}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                {/* Range + numeric pair */}
                <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-3">
                  <input
                    type="range"
                    min={1}
                    max={15}
                    step={1}
                    value={partySize}
                    onChange={(e) => setPartySize(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-white/80"
                    aria-valuemin={1}
                    aria-valuemax={15}
                    aria-valuenow={partySize}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Decrease"
                      onClick={() => setPartySize((v) => Math.max(1, Math.min(15, v - 1)))}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-white/5 text-white/90 hover:bg-white/10"
                    >
                      –
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      step={1}
                      value={partySize}
                      onChange={(e) => {
                        const v = e.target.value;
                        const n = Number((v || '').replace(/[^0-9]/g, ''));
                        setPartySize(Math.max(1, Math.min(15, n || 1)));
                      }}
                      className="w-16 rounded-xl border border-white/15 bg-white/5 px-2 py-1.5 text-center text-white/90"
                      inputMode="numeric"
                      enterKeyHint="next"
                    />
                    <button
                      type="button"
                      aria-label="Increase"
                      onClick={() => setPartySize((v) => Math.max(1, Math.min(15, v + 1)))}
                      className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-white/5 text-white/90 hover:bg-white/10"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <FloatingInput
                label="Location"
                value={location}
                onChange={setLocation}
                name="street-address"
                autoComplete="street-address"
                inputMode="text"
                enterKeyHint="next"
              />
            </section>
          )}

          {/* Step 2: Options */}
          {step === 2 && (
            <section className="grid grid-cols-1 gap-4">
              <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-3">
                <label className="text-sm text-white/80">Add-ons</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {addOns?.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleAddOn(a.id)}
                      className={clsx(
                        'rounded-full border px-3 py-1 text-sm transition-colors',
                        selAddOns.includes(a.id)
                          ? 'border-white/30 bg-white/15 text-white'
                          : 'border-white/12 bg-transparent text-white/80 hover:bg-white/10',
                      )}
                      aria-pressed={selAddOns.includes(a.id)}
                    >
                      {a.label}
                      {a.price ? ` — ${a.price}` : ''}
                    </button>
                  ))}
                </div>
              </div>

              <FloatingTextArea
                label="Notes"
                value={notes}
                onChange={setNotes}
                placeholder="Share any details, looks, or timing"
                autoComplete="on"
                enterKeyHint="done"
                rows={4}
              />
            </section>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <section className="space-y-3">
              <div className="rounded-2xl border border-white/12 bg-white/[0.04] p-4">
                <h3 className="text-sm font-semibold text-white/90">Summary</h3>
                <dl className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <Row label="Name" value={name} />
                  <Row label="Email" value={email || '—'} />
                  <Row label="Phone" value={phone || '—'} />
                  <Row label="Service" value={chosenServiceTitle || '—'} />
                  <Row label="Date" value={date || '—'} />
                  <Row label="Location" value={location || '—'} />
                  <Row label="Party Size" value={String(partySize)} />
                  <Row label="Add-ons" value={selAddOns.length ? selAddOns.join(', ') : '—'} />
                  <Row label="Notes" value={notes || '—'} full />
                </dl>
              </div>
              <p className="text-xs text-white/70">
                We’ll confirm availability and get back to you with next steps.
              </p>
            </section>
          )}
        </div>

        {/* Sticky footer actions */}
        <div className="pointer-events-auto relative z-10 border-t border-white/12 bg-[rgb(18,13,10)]/94 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <button
              className="inline-flex h-11 min-w-[88px] items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 text-sm text-white/90 hover:bg-white/10 disabled:opacity-50"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || submitting}
              type="button"
            >
              Back
            </button>

            <div className="flex items-center gap-2">
              <a
                href={`sms:+16193996160?&body=${smsBody}`}
                className="hidden h-11 items-center justify-center rounded-full border border-white/15 bg-white/5 px-4 text-sm text-white/90 hover:bg-white/10 sm:inline-flex"
              >
                Text instead
              </a>

              {step < 3 ? (
                <button
                  className="inline-flex h-11 min-w-[130px] items-center justify-center rounded-full px-5 text-sm font-medium text-[rgb(18,13,10)] shadow transition-transform hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    background: 'linear-gradient(180deg, rgba(203,185,164,1), rgba(156,127,99,1))',
                    boxShadow: '0 16px 40px rgba(0,0,0,.28)',
                  }}
                  onClick={goNext}
                  disabled={!!Object.keys(errors).length || submitting}
                  type="button"
                >
                  Next
                </button>
              ) : (
                <button
                  className="inline-flex h-11 min-w-[130px] items-center justify-center rounded-full px-5 text-sm font-medium text-[rgb(18,13,10)] shadow transition-transform hover:scale-[1.01] active:scale-[0.99]"
                  style={{
                    background: 'linear-gradient(180deg, rgba(203,185,164,1), rgba(156,127,99,1))',
                    boxShadow: '0 16px 40px rgba(0,0,0,.28)',
                  }}
                  onClick={submit}
                  disabled={submitting || !name.trim() || !chosenServiceTitle}
                  type="button"
                >
                  {submitting ? 'Sending…' : 'Send inquiry'}
                </button>
              )}
            </div>
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
        /* Ensure iOS/Android autofill stays readable on dark bg */
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

/* ---------- Inputs ---------- */

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
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  autoComplete,
  enterKeyHint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  autoComplete?: string;
  enterKeyHint?: 'next' | 'done';
}) {
  return (
    <div className="group relative">
      <textarea
        className={clsx(
          'peer w-full rounded-xl border px-3 pt-[20px] text-white/95 transition outline-none',
          'border-white/15 bg-white/[0.06] placeholder-transparent focus:border-white/30 focus:bg-white/[0.1]',
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
        required={required}
      >
        <option value="" disabled hidden>
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
          // mimic floating for select: keep small label when a value exists
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

function Row({ label, value, full = false }: { label: string; value: string; full?: boolean }) {
  return (
    <div className={clsx('flex items-start gap-2', full && 'sm:col-span-2')}>
      <dt className="w-28 shrink-0 text-xs tracking-wide text-white/60 uppercase">{label}</dt>
      <dd className="text-sm leading-6 text-white/90">{value}</dd>
    </div>
  );
}
