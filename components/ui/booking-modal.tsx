'use client';

import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';

type Service = { id: string; title: string } | undefined;
type AddOn = { id: string; label: string; price?: string };

type DoneState = { type: 'success' | 'error'; msg: string } | null;
type Step = 'service' | 'contact' | 'details' | 'addons' | 'review';

/* Helpers */
function toDateInputValue(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const a = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${a}`;
}
function clampPartySize(v: number) {
  if (Number.isNaN(v)) return '';
  return Math.max(1, Math.min(15, v));
}

export default function BookingModal({
  open,
  onClose,
  service: initialService,
  addOns = [],
}: {
  open: boolean;
  onClose: () => void;
  service?: Service;
  addOns?: AddOn[];
}) {
  const [service, setService] = useState<Service>(initialService);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [partySize, setPartySize] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [selAddOns, setSelAddOns] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<DoneState>(null);

  const firstStep: Step = service?.title ? 'contact' : 'service';
  const [step, setStep] = useState<Step>(firstStep);

  // Date window: today → +2 years (prevents 9999 etc.)
  const minDate = useMemo(() => toDateInputValue(new Date()), []);
  const maxDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2);
    return toDateInputValue(d);
  }, []);

  // lock body scroll only while open
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    if (open) document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [open]);

  // if a service arrives later, skip the service step
  useEffect(() => {
    if (initialService && !service) {
      setService(initialService);
      if (step === 'service') setStep('contact');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialService]);

  const toggleAddOn = (id: string) =>
    setSelAddOns((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const smsBody = useMemo(() => {
    const lines = [
      'Booking Inquiry',
      name ? `Name: ${name}` : '',
      email ? `Email: ${email}` : '',
      phone ? `Phone: ${phone}` : '',
      service?.title ? `Service: ${service.title}` : '',
      date ? `Date: ${date}` : '',
      location ? `Location: ${location}` : '',
      partySize ? `Party Size: ${String(partySize)}` : '',
      selAddOns.length ? `Add-ons: ${selAddOns.join(', ')}` : '',
      notes ? `Notes: ${notes}` : '',
    ].filter(Boolean);
    return encodeURIComponent(lines.join('\n'));
  }, [name, email, phone, service, date, location, partySize, selAddOns, notes]);

  // DETAILS step validation (date window + party size 1..15)
  const detailsError = useMemo(() => {
    if (date) {
      const v = new Date(`${date}T00:00:00`);
      const lo = new Date(`${minDate}T00:00:00`);
      const hi = new Date(`${maxDate}T00:00:00`);
      if (v < lo) return 'Please choose today or a future date.';
      if (v > hi) return `Please choose a date on or before ${maxDate}.`;
    }
    if (partySize !== '' && (partySize < 1 || partySize > 15)) {
      return 'Party size must be between 1 and 15.';
    }
    return null;
  }, [date, partySize, minDate, maxDate]);

  const canNext = (() => {
    switch (step) {
      case 'service':
        return Boolean(service?.title);
      case 'contact':
        return name.trim().length > 1 && (email.trim().length > 3 || phone.trim().length > 6);
      case 'details':
        return !detailsError; // block next if invalid date/party size
      case 'addons':
        return true;
      case 'review':
        return !submitting;
    }
  })();

  async function submit() {
    setSubmitting(true);
    setDone(null);
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
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
      if (!json.ok) throw new Error(json.error || 'Send failed');
      setDone({ type: 'success', msg: 'Sent! We’ll get back to you shortly.' });
      setTimeout(onClose, 900);
    } catch (err: any) {
      setDone({ type: 'error', msg: err?.message || 'Send failed' });
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    if (!canNext) return;
    setDone(null);
    if (step === 'service') setStep('contact');
    else if (step === 'contact') setStep('details');
    else if (step === 'details') setStep('addons');
    else if (step === 'addons') setStep('review');
    else if (step === 'review') submit();
  }

  function back() {
    setDone(null);
    if (step === 'review') setStep('addons');
    else if (step === 'addons') setStep('details');
    else if (step === 'details') setStep('contact');
    else if (step === 'contact') setStep(service?.title ? 'contact' : 'service');
  }

  const steps: Step[] = service?.title
    ? ['contact', 'details', 'addons', 'review']
    : ['service', 'contact', 'details', 'addons', 'review'];
  const activeIndex = steps.indexOf(step);

  return (
    <div
      className={clsx(
        'fixed inset-0 z-[100] transition',
        open ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
      aria-hidden={!open}
    >
      <button
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        className={clsx(
          'relative mx-auto flex h-[100dvh] w-full flex-col bg-[var(--card)] transition-transform',
          open ? 'md:translate-y-0' : 'md:translate-y-2',
          'md:border-border/70 md:my-6 md:h-[88dvh] md:max-w-lg md:rounded-2xl md:border md:shadow-[0_24px_70px_rgba(0,0,0,0.26)]',
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
      >
        {/* Header */}
        <div className="border-border/60 flex items-center justify-between gap-3 border-b px-4 py-3">
          <h2 id="booking-title" className="text-base font-semibold sm:text-lg">
            {stepTitle(step, service?.title)}
          </h2>

          <div className="flex items-center gap-3">
            <div className="text-foreground/60 hidden text-xs sm:inline">
              Step {activeIndex + 1} of {steps.length}
            </div>
            <button
              onClick={onClose}
              className="icon-chip inline-grid h-9 w-9 place-items-center rounded-xl"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="bg-border/40 h-1 w-full">
          <div
            className="bg-primary h-full transition-[width]"
            style={{ width: `${((activeIndex + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          {step === 'service' && (
            <ServiceStep selected={service?.id} onSelect={(s) => setService(s)} />
          )}

          {step === 'contact' && (
            <ContactStep
              name={name}
              email={email}
              phoneOrText={phone}
              onName={setName}
              onEmail={setEmail}
              onPhone={setPhone}
            />
          )}

          {step === 'details' && (
            <DetailsStep
              serviceTitle={service?.title}
              date={date}
              location={location}
              partySize={partySize}
              notes={notes}
              minDate={minDate}
              maxDate={maxDate}
              error={detailsError}
              onDate={(v) => setDate(v)}
              onLocation={setLocation}
              onPartySize={(v) => {
                if (v === '') return setPartySize('');
                setPartySize(clampPartySize(Number(v)));
              }}
              onNotes={setNotes}
            />
          )}

          {step === 'addons' && (
            <AddOnsStep addOns={addOns} selected={selAddOns} toggle={toggleAddOn} />
          )}

          {step === 'review' && (
            <ReviewStep
              name={name}
              email={email}
              phone={phone}
              service={service?.title}
              date={date}
              location={location}
              partySize={partySize}
              addOns={selAddOns.map((id) => addOns.find((a) => a.id === id)?.label || id)}
              notes={notes}
            />
          )}

          {done && (
            <p
              className={clsx(
                'mt-3 text-sm',
                done.type === 'success' ? 'text-emerald-600' : 'text-destructive',
              )}
            >
              {done.msg}
            </p>
          )}
        </div>

        {/* Sticky footer */}
        <div className="border-border/60 border-t bg-[var(--card)] px-4 py-3 sm:px-5">
          <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
            <a
              href={`sms:+16193996160?&body=${smsBody}`}
              className="border-border/70 bg-card/70 hover:bg-accent/15 inline-flex h-12 items-center justify-center rounded-full border px-4 text-sm"
            >
              Text instead
            </a>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={back}
                disabled={step === firstStep || submitting}
                className="border-border/70 bg-card/70 hover:bg-accent/10 inline-flex h-12 items-center justify-center rounded-full border px-5 text-sm disabled:opacity-50"
              >
                Back
              </button>

              <button
                type="button"
                onClick={step === 'review' ? submit : next}
                disabled={!canNext}
                className="gbtn specular inline-flex h-12 items-center justify-center rounded-full px-6 text-sm disabled:opacity-60"
              >
                {step === 'review' ? (submitting ? 'Sending…' : 'Send request') : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Step components ---------- */

function stepTitle(step: Step, serviceTitle?: string) {
  switch (step) {
    case 'service':
      return 'Choose your service';
    case 'contact':
      return 'Your contact';
    case 'details':
      return serviceTitle ? `Details — ${serviceTitle}` : 'Event details';
    case 'addons':
      return 'Optional add-ons';
    case 'review':
      return 'Review & send';
  }
}

function Field({
  label,
  children,
  hint,
  invalid = false,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  invalid?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm">{label}</span>
      <div className={clsx(invalid && 'ring-destructive/50 rounded-lg ring-1')}>{children}</div>
      {hint ? <span className="text-foreground/60 text-xs">{hint}</span> : null}
    </label>
  );
}

function ServiceStep({
  selected,
  onSelect,
}: {
  selected?: string;
  onSelect: (s: { id: string; title: string }) => void;
}) {
  const OPTIONS = [
    { id: 'bridal-day', title: 'Bridal Makeup' },
    { id: 'bridal-party', title: 'Bridal Party Makeup' },
    { id: 'special-occasion', title: 'Special Occasion Makeup' },
    { id: 'editorial', title: 'Editorial & Brand Work' },
    { id: 'studio', title: 'Studio Appointment' },
    { id: 'destination', title: 'Destination Wedding' },
  ];
  return (
    <div className="grid gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onSelect(opt)}
          className={clsx(
            'flex items-center justify-between rounded-xl border px-4 py-3 text-left',
            selected === opt.id
              ? 'border-primary bg-primary/10'
              : 'border-border hover:bg-accent/10',
          )}
        >
          <span className="font-medium">{opt.title}</span>
          {selected === opt.id ? (
            <span className="text-primary text-xs">Selected</span>
          ) : (
            <span className="text-foreground/60 text-xs">Choose</span>
          )}
        </button>
      ))}
    </div>
  );
}

function ContactStep({
  name,
  email,
  phoneOrText,
  onName,
  onEmail,
  onPhone,
}: {
  name: string;
  email: string;
  phoneOrText: string;
  onName: (v: string) => void;
  onEmail: (v: string) => void;
  onPhone: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3">
      <Field label="Name *">
        <input
          className="crm-input"
          placeholder="Jane Doe"
          value={name}
          onChange={(e) => onName(e.target.value)}
          autoComplete="name"
          autoCapitalize="words"
          inputMode="text"
          required
        />
      </Field>

      <Field label="Email">
        <input
          className="crm-input"
          placeholder="jane@email.com"
          value={email}
          onChange={(e) => onEmail(e.target.value)}
          type="email"
          autoComplete="email"
          inputMode="email"
        />
      </Field>

      <Field label="Phone">
        <input
          className="crm-input"
          placeholder="(555) 555-5555"
          value={phoneOrText}
          onChange={(e) => onPhone(e.target.value)}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
        />
      </Field>

      <p className="text-foreground/60 text-xs">Provide at least one: email or phone.</p>
    </div>
  );
}

function DetailsStep({
  serviceTitle,
  date,
  location,
  partySize,
  notes,
  minDate,
  maxDate,
  error,
  onDate,
  onLocation,
  onPartySize,
  onNotes,
}: {
  serviceTitle?: string;
  date: string;
  location: string;
  partySize: number | '';
  notes: string;
  minDate: string;
  maxDate: string;
  error: string | null;
  onDate: (v: string) => void;
  onLocation: (v: string) => void;
  onPartySize: (v: number | '') => void;
  onNotes: (v: string) => void;
}) {
  const dateInvalid = !!date && (date < minDate || date > maxDate);
  const sizeInvalid = partySize !== '' && (partySize < 1 || partySize > 15);

  return (
    <div className="grid grid-cols-1 gap-3">
      <Field label="Preferred date" hint={`Allowed: ${minDate} → ${maxDate}`} invalid={dateInvalid}>
        <input
          className="crm-input"
          type="date"
          value={date}
          onChange={(e) => onDate(e.target.value)}
          autoComplete="off"
          min={minDate}
          max={maxDate}
        />
      </Field>

      <Field label="Location">
        <input
          className="crm-input"
          placeholder="Venue / City"
          value={location}
          onChange={(e) => onLocation(e.target.value)}
          autoComplete="address-level2"
          inputMode="text"
        />
      </Field>

      <Field label="Party size" hint="Up to 15 people." invalid={sizeInvalid}>
        <input
          className="crm-input"
          type="number"
          min={1}
          max={15}
          placeholder="e.g., 6"
          value={partySize}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === '') return onPartySize('');
            onPartySize(clampPartySize(Number(raw)));
          }}
          inputMode="numeric"
        />
      </Field>

      <Field label={serviceTitle ? `Notes for ${serviceTitle}` : 'Notes'}>
        <textarea
          className="crm-input min-h-[100px]"
          placeholder="Share looks, timing, allergies, or anything else"
          value={notes}
          onChange={(e) => onNotes(e.target.value)}
        />
      </Field>

      {error ? <p className="text-destructive text-sm">{error}</p> : null}
    </div>
  );
}

function AddOnsStep({
  addOns,
  selected,
  toggle,
}: {
  addOns: AddOn[];
  selected: string[];
  toggle: (id: string) => void;
}) {
  if (!addOns?.length) {
    return <p className="text-foreground/70 text-sm">No add-ons available for this service.</p>;
  }
  return (
    <div>
      <div className="mt-1 flex flex-wrap gap-2">
        {addOns.map((a) => {
          const on = selected.includes(a.id);
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => toggle(a.id)}
              className={clsx(
                'crm-chip',
                on ? 'border-primary bg-primary/10' : 'hover:bg-accent/15',
              )}
              aria-pressed={on}
            >
              {a.label}
              {a.price ? ` — ${a.price}` : ''}
            </button>
          );
        })}
      </div>
      <p className="text-foreground/60 mt-2 text-xs">
        You can adjust add-ons later during consultation.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-foreground/60">{label}</span>
      <span className="text-foreground/90 font-medium">{String(value)}</span>
    </div>
  );
}

function ReviewStep({
  name,
  email,
  phone,
  service,
  date,
  location,
  partySize,
  addOns,
  notes,
}: {
  name: string;
  email: string;
  phone: string;
  service?: string;
  date: string;
  location: string;
  partySize: number | '';
  addOns: string[];
  notes: string;
}) {
  return (
    <div className="grid gap-3 text-sm">
      <Row label="Service" value={service} />
      <Row label="Name" value={name} />
      <Row label="Email" value={email} />
      <Row label="Phone" value={phone} />
      <Row label="Date" value={date} />
      <Row label="Location" value={location} />
      <Row label="Party size" value={partySize || undefined} />
      {!!addOns.length && <Row label="Add-ons" value={addOns.join(', ')} />}
      <div>
        <div className="text-foreground/60">Notes</div>
        <div className="mt-1 whitespace-pre-wrap">{notes || '—'}</div>
      </div>
      <p className="text-foreground/60 mt-1 text-xs">
        We’ll confirm availability and follow up with next steps.
      </p>
    </div>
  );
}
