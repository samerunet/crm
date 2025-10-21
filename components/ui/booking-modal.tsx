'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

type Service = { id: string; title: string } | undefined;
type AddOn = { id: string; label: string; price?: string };

type DoneState = { type: 'success' | 'error'; msg: string } | null;
type Step = 'service' | 'contact' | 'details' | 'addons' | 'review';

const MIN_PARTY = 1;
const MAX_PARTY = 15;

/* ---------- utils ---------- */
function toDateInputValue(d: Date) {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const a = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${a}`;
}
function clampPartySize(v: number) {
  if (Number.isNaN(v)) return '';
  return Math.max(MIN_PARTY, Math.min(MAX_PARTY, v));
}

/* inject minimal keyframes + input “cute” focus ring once */
const KF_ID = 'booking-modern-kf';
if (typeof document !== 'undefined' && !document.getElementById(KF_ID)) {
  const css = `
@keyframes fadeInUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
@keyframes sheetIn  { from { opacity: .0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
@keyframes pulseDot { 0%, 100% { transform: scale(1); opacity: .6 } 50% { transform: scale(1.18); opacity: 1 } }
.modern-input:focus{ outline: none; box-shadow: 0 0 0 2px rgba(255,255,255,.18), inset 0 0 0 1px rgba(255,255,255,.28) }
`;
  const el = document.createElement('style');
  el.id = KF_ID;
  el.textContent = css;
  document.head.appendChild(el);
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
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Date window: today → +2 years
  const minDate = useMemo(() => toDateInputValue(new Date()), []);
  const maxDate = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 2);
    return toDateInputValue(d);
  }, []);

  // lock scroll while open
  useEffect(() => {
    const prev = document.documentElement.style.overflow;
    if (open) document.documentElement.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [open]);

  // sync externally-passed service
  useEffect(() => {
    if (initialService && !service) {
      setService(initialService);
      if (step === 'service') setStep('contact');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialService]);

  // ESC to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Keyboard-aware bottom bar (iOS Safari etc.)
  useEffect(() => {
    const vv = typeof window !== 'undefined' ? window.visualViewport : null;
    const apply = () => {
      const kb = vv && window.innerHeight - vv.height > 60 ? window.innerHeight - vv.height : 0;
      document.documentElement.style.setProperty('--kb', kb + 'px');
    };
    apply();
    vv?.addEventListener('resize', apply);
    vv?.addEventListener('scroll', apply);
    return () => {
      vv?.removeEventListener('resize', apply);
      vv?.removeEventListener('scroll', apply);
      document.documentElement.style.removeProperty('--kb');
    };
  }, []);

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

  // details validation
  const detailsError = useMemo(() => {
    if (date) {
      const v = new Date(`${date}T00:00:00`);
      const lo = new Date(`${minDate}T00:00:00`);
      const hi = new Date(`${maxDate}T00:00:00`);
      if (v < lo) return 'Please choose today or a future date.';
      if (v > hi) return `Please choose a date on or before ${maxDate}.`;
    }
    if (partySize !== '' && (partySize < MIN_PARTY || partySize > MAX_PARTY)) {
      return `Party size must be between ${MIN_PARTY} and ${MAX_PARTY}.`;
    }
    return null;
  }, [date, partySize, minDate, maxDate]);

  // Scroll first invalid field into view when hitting Next
  function scrollFirstInvalid() {
    const host = contentRef.current;
    if (!host) return;
    const invalid = host.querySelector<HTMLElement>('[data-invalid="true"]');
    invalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const canNext = (() => {
    switch (step) {
      case 'service':
        return Boolean(service?.title);
      case 'contact':
        return name.trim().length > 1 && (email.trim().length > 3 || phone.trim().length > 6);
      case 'details':
        return !detailsError;
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
      if (navigator.vibrate) navigator.vibrate(10);
    } catch (err: any) {
      setDone({ type: 'error', msg: err?.message || 'Send failed' });
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    if (!canNext) {
      scrollFirstInvalid();
      return;
    }
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
        'fixed inset-0 z-[100]',
        open ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-[rgba(0,0,0,.58)] backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={clsx(
          'relative mx-auto flex h-[100dvh] w-full flex-col overflow-hidden',
          'md:my-6 md:h-[88dvh] md:max-w-lg md:rounded-[22px] md:border md:border-white/10',
          'bg-gradient-to-b from-white/14 via-white/[.07] to-white/[.05] text-[--foreground]',
          'shadow-[0_24px_70px_rgba(0,0,0,0.26)]',
          open && 'animate-[sheetIn_.22s_ease-out]',
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        style={{
          WebkitBackdropFilter: 'blur(16px) saturate(135%)',
          backdropFilter: 'blur(16px) saturate(135%)',
        }}
      >
        {/* soft glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div
            className="absolute -top-10 left-[-10%] h-40 w-[120%] opacity-70 blur-3xl"
            style={{
              background:
                'radial-gradient(60% 60% at 50% 0%, rgba(176,137,104,.28), transparent 70%)',
            }}
          />
        </div>

        {/* Header (kept slim on mobile) */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
          <div>
            <div className="text-[10px] tracking-[0.22em] text-white/70 uppercase">Booking</div>
            <h2 id="booking-title" className="text-base font-semibold sm:text-lg">
              {stepTitle(step, service?.title)}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Dots count={steps.length} active={activeIndex} />
            <button
              onClick={onClose}
              className="inline-grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-white/[.08] hover:bg-white/[.14]"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
          <Panel active={step === 'service'}>
            <ServiceStep selected={service?.id} onSelect={(s) => setService(s)} />
          </Panel>

          <Panel active={step === 'contact'}>
            <ContactStep
              name={name}
              email={email}
              phoneOrText={phone}
              onName={setName}
              onEmail={setEmail}
              onPhone={setPhone}
            />
          </Panel>

          <Panel active={step === 'details'}>
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
          </Panel>

          <Panel active={step === 'addons'}>
            <AddOnsStep addOns={addOns} selected={selAddOns} toggle={toggleAddOn} />
          </Panel>

          <Panel active={step === 'review'}>
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
          </Panel>

          {done && (
            <p
              role="status"
              className={clsx(
                'mt-3 text-sm',
                done.type === 'success' ? 'text-emerald-400' : 'text-rose-400',
              )}
            >
              {done.msg}
            </p>
          )}
        </div>

        {/* Fixed bottom action bar — thumb zone, keyboard-aware */}
        <div
          className="md:backdrop-blur-0 fixed inset-x-0 z-[101] border-t border-white/10 bg-[color-mix(in_oklab,white_6%,transparent)] px-4 py-3 backdrop-blur-md sm:px-5 md:relative md:border-t md:bg-transparent"
          style={{ bottom: 'calc(env(safe-area-inset-bottom) + var(--kb, 0px))' }}
        >
          <div className="mx-auto flex max-w-lg items-center justify-between gap-2">
            <button
              type="button"
              onClick={back}
              disabled={step === firstStep || submitting}
              className="h-12 min-w-[88px] rounded-full border border-white/15 bg-white/[.06] px-5 text-sm hover:bg-white/[.12] disabled:opacity-50"
            >
              Back
            </button>

            <div className="flex items-center gap-2">
              <a
                href={`sms:+16193996160?&body=${smsBody}`}
                className="hidden h-12 items-center justify-center rounded-full border border-white/15 bg-white/[.06] px-4 text-sm hover:bg-white/[.12] sm:inline-flex"
              >
                Text instead
              </a>

              <button
                type="button"
                onClick={step === 'review' ? submit : next}
                disabled={!canNext}
                className="h-12 min-w-[140px] rounded-full bg-white px-6 text-sm font-medium text-black hover:opacity-95 active:opacity-90 disabled:opacity-60"
                style={{ boxShadow: '0 14px 34px rgba(0,0,0,0.24)' }}
              >
                {step === 'review' ? (submitting ? 'Sending…' : 'Send inquiry') : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- shared UI ---------------- */

function Dots({ count, active }: { count: number; active: number }) {
  return (
    <div className="hidden gap-1.5 sm:flex">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={clsx(
            'h-2 w-2 rounded-full',
            i === active
              ? 'animate-[pulseDot_1.2s_ease-in-out_infinite] bg-white/90'
              : 'bg-white/35',
          )}
        />
      ))}
    </div>
  );
}
function Panel({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div
      className={clsx(active ? 'animate-[fadeInUp_.18s_ease-out] opacity-100' : 'hidden opacity-0')}
    >
      {children}
    </div>
  );
}

function FloatField({
  id,
  label,
  hint,
  invalid = false,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  invalid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative" data-invalid={invalid || undefined}>
      <label
        htmlFor={id}
        className={clsx(
          'pointer-events-none absolute top-2 left-3 z-10 origin-[0_0] text-xs text-white/70 transition-all',
          'peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs',
        )}
      >
        {label}
      </label>
      <div className={clsx(invalid && 'rounded-xl ring-1 ring-rose-400/50')}>{children}</div>
      {hint ? <div className="mt-1 text-xs text-white/70">{hint}</div> : null}
    </div>
  );
}

/* ---------------- steps ---------------- */

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
      {OPTIONS.map((opt) => {
        const on = selected === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt)}
            className={clsx(
              'flex items-center justify-between rounded-xl border px-4 py-3 text-left',
              'border-white/12 bg-white/[.05] hover:bg-white/[.10]',
              on && 'border-white/30 bg-white/[.12]',
            )}
          >
            <span className="font-medium">{opt.title}</span>
            <span className={clsx('text-xs', on ? 'text-white' : 'text-white/60')}>
              {on ? 'Selected' : 'Choose'}
            </span>
          </button>
        );
      })}
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
      <FloatField id="bf-name" label="Name *">
        <input
          id="bf-name"
          className="modern-input peer h-12 w-full rounded-xl border border-white/15 bg-white/[.06] px-3 pt-4 text-sm placeholder-transparent backdrop-blur-sm outline-none"
          placeholder=" "
          value={name}
          onChange={(e) => onName(e.target.value)}
          autoComplete="name"
          autoCapitalize="words"
          inputMode="text"
          required
        />
      </FloatField>

      <FloatField id="bf-email" label="Email">
        <input
          id="bf-email"
          className="modern-input peer h-12 w-full rounded-xl border border-white/15 bg-white/[.06] px-3 pt-4 text-sm placeholder-transparent backdrop-blur-sm outline-none"
          placeholder=" "
          value={email}
          onChange={(e) => onEmail(e.target.value)}
          type="email"
          autoComplete="email"
          inputMode="email"
        />
      </FloatField>

      <FloatField id="bf-phone" label="Phone">
        <input
          id="bf-phone"
          className="modern-input peer h-12 w-full rounded-xl border border-white/15 bg-white/[.06] px-3 pt-4 text-sm placeholder-transparent backdrop-blur-sm outline-none"
          placeholder=" "
          value={phoneOrText}
          onChange={(e) => onPhone(e.target.value)}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
        />
      </FloatField>

      <p className="text-xs text-white/70">Provide at least one: email or phone.</p>
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
  const sizeInvalid = partySize !== '' && (partySize < MIN_PARTY || partySize > MAX_PARTY);

  const quickSizes = [1, 3, 5, 10, 15];

  return (
    <div className="grid grid-cols-1 gap-3">
      <FloatField
        id="bf-date"
        label="Preferred date"
        hint={`Allowed: ${minDate} → ${maxDate}`}
        invalid={dateInvalid}
      >
        <input
          id="bf-date"
          className="modern-input peer h-12 w-full rounded-xl border border-white/15 bg-white/[.06] px-3 pt-4 text-sm placeholder-transparent backdrop-blur-sm outline-none"
          type="date"
          placeholder=" "
          value={date}
          onChange={(e) => onDate(e.target.value)}
          autoComplete="off"
          min={minDate}
          max={maxDate}
        />
      </FloatField>

      <FloatField id="bf-location" label="Location">
        <input
          id="bf-location"
          className="modern-input peer h-12 w-full rounded-xl border border-white/15 bg-white/[.06] px-3 pt-4 text-sm placeholder-transparent backdrop-blur-sm outline-none"
          placeholder=" "
          value={location}
          onChange={(e) => onLocation(e.target.value)}
          autoComplete="address-level2"
          inputMode="text"
        />
      </FloatField>

      <div className="grid gap-2">
        <FloatField id="bf-size" label="Party size" hint="Up to 15 people." invalid={sizeInvalid}>
          <div className="flex items-center rounded-xl border border-white/15 bg-white/[.06] p-1">
            <button
              type="button"
              onClick={() =>
                onPartySize(partySize === '' ? MIN_PARTY : clampPartySize(Number(partySize) - 1))
              }
              className="h-10 w-10 rounded-lg bg-white/[.06] hover:bg-white/[.12]"
              aria-label="Decrease"
            >
              –
            </button>
            <input
              id="bf-size"
              className="modern-input h-10 w-full bg-transparent text-center text-sm outline-none"
              type="number"
              min={MIN_PARTY}
              max={MAX_PARTY}
              placeholder="—"
              value={partySize}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === '') return onPartySize('');
                onPartySize(clampPartySize(Number(raw)));
              }}
              inputMode="numeric"
            />
            <button
              type="button"
              onClick={() =>
                onPartySize(partySize === '' ? MIN_PARTY : clampPartySize(Number(partySize) + 1))
              }
              className="h-10 w-10 rounded-lg bg-white/[.06] hover:bg-white/[.12]"
              aria-label="Increase"
            >
              +
            </button>
          </div>
        </FloatField>

        <div className="flex flex-wrap gap-2">
          {quickSizes.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onPartySize(n)}
              className={clsx(
                'rounded-full border px-3 py-1.5 text-xs transition',
                partySize === n
                  ? 'border-white/30 bg-white/[.16] text-white'
                  : 'border-white/15 bg-white/[.06] text-white/80 hover:bg-white/[.10]',
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <FloatField id="bf-notes" label={serviceTitle ? `Notes for ${serviceTitle}` : 'Notes'}>
        <textarea
          id="bf-notes"
          className="modern-input min-h-[110px] w-full rounded-xl border border-white/15 bg-white/[.06] px-3 py-3 text-sm placeholder-transparent backdrop-blur-sm outline-none"
          placeholder=" "
          value={notes}
          onChange={(e) => onNotes(e.target.value)}
        />
      </FloatField>

      {error ? (
        <p className="text-sm text-rose-400" role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}
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
    return <p className="text-sm text-white/70">No add-ons available for this service.</p>;
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
                'rounded-full border px-3 py-1.5 text-sm transition',
                on
                  ? 'border-white/30 bg-white/[.16] text-white'
                  : 'border-white/15 bg-white/[.06] text-white/80 hover:bg-white/[.10]',
              )}
              aria-pressed={on}
            >
              {a.label}
              {a.price ? ` — ${a.price}` : ''}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-white/70">
        You can adjust add-ons later during consultation.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-white/70">{label}</span>
      <span className="font-medium text-white">{String(value)}</span>
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
        <div className="text-white/70">Notes</div>
        <div className="mt-1 whitespace-pre-wrap">{notes || '—'}</div>
      </div>
      <p className="mt-1 text-xs text-white/70">
        We’ll confirm availability and follow up with next steps.
      </p>
    </div>
  );
}

function DotsOrLabel() {
  return null;
}

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
