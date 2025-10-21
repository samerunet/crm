// app/services/_components/services-client.tsx
'use client';

import { useRef, useState, type MouseEvent, type KeyboardEvent, type ReactNode } from 'react';
import { useBooking } from '@/components/ui/booking-provider';

type Service = {
  id: string;
  emoji?: string;
  title: string;
  serviceLine: string;
  duration: string;
  rate?: string;
  includes: string[];
  addons?: string[];
  note?: string;
};

const SERVICES: Service[] = [
  {
    id: 'bridal-day',
    emoji: '💍',
    title: 'Bridal Makeup',
    serviceLine: 'Service: Bridal Makeup',
    duration: 'Duration: 1 hr 15 min – 1 hr 30 min',
    includes: [
      'Full luxury skin prep',
      'Works with all skin tones, eye shapes & maternity skin',
      'Customized long-lasting makeup (natural glam, soft glam, full glam)',
      'Individual or strip lashes',
      'Prep list for glam',
      'On-location or in-studio service',
    ],
    addons: [
      'Trial appointment',
      'Stay for touch-ups or a second look',
      'Hair services by hairstylist upon request',
    ],
  },
  {
    id: 'bridal-party',
    emoji: '👰‍♀️',
    title: 'Bridal Party Makeup',
    serviceLine: 'Service: Bridesmaids / Mother of the Bride / Guests',
    duration: 'Duration: 35–45 min per person',
    includes: [
      'Long-lasting event makeup (natural glam, soft glam)',
      'Lashes included',
      'Timeline coordinated with the bride’s schedule',
    ],
    addons: ['Hair services by hairstylist upon request'],
  },
  {
    id: 'special-occasion',
    emoji: '💫',
    title: 'Special Occasion Makeup',
    serviceLine: 'Service: Event • Engagement • Birthday • Photoshoot',
    duration: 'Duration: 1 hour',
    includes: [
      'Skin prep',
      'Lashes included',
      'Long-lasting glam for any occasion',
      'Available in studio or on-location (travel minimum may apply)',
    ],
    addons: ['Hair services by team hairstylists upon request'],
  },
  {
    id: 'editorial',
    emoji: '🖤',
    title: 'Editorial & Brand Work',
    serviceLine: 'Service: Campaign • Fashion • Branding',
    duration: 'Duration: Based on project requirements',
    rate: 'Rate: Custom quote',
    includes: [
      'Makeup tailored for photo + video',
      'On-set touch-ups throughout the shoot',
      'Collaboration with the creative team',
    ],
    addons: ['Hair services by hairstylist upon request'],
  },
  {
    id: 'studio',
    emoji: '📸',
    title: 'Studio Appointments',
    serviceLine: 'Service: In-Studio Makeup (San Diego)',
    duration: 'Duration: 1 hour',
    includes: [
      'Private studio appointment',
      'Lashes included',
      'Natural glam • Soft glam • Full glam',
      'Ideal for special occasions, maternity, portraits',
    ],
    addons: ['Hair services by hairstylist upon request'],
  },
  {
    id: 'destination',
    emoji: '✈️',
    title: 'Destination Weddings',
    serviceLine: 'Service: On-location Bridal (outside San Diego / International)',
    duration: 'Duration: Varies by event schedule',
    includes: [
      'Luxury bridal makeup for the bride',
      'Optional makeup for bridesmaids / family',
      'Skin prep, lashes, and personalized service',
      'Assistance with schedule and travel coordination',
    ],
    addons: [
      'Hair services by hairstylist',
      'Touch-up services',
      'Bridal trial',
      'Travel fee calculated per destination',
    ],
  },
];

export default function ServicesClient() {
  return (
    <main className="f-container relative py-6 md:py-10">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-x-0 -top-20 h-[140px] opacity-60 blur-2xl md:h-[180px]"
          style={{
            background:
              'radial-gradient(60% 60% at 50% 0%, rgba(176,137,104,.30), transparent 70%)',
          }}
        />
      </div>

      <div className="specular glass-2 -mx-3 overflow-hidden rounded-[22px] sm:-mx-6 md:rounded-[28px]">
        <div className="p-4 sm:p-6 md:p-8">
          <header className="mb-4 text-center sm:mb-6">
            <h1
              className="font-serif text-[28px] font-semibold tracking-tight sm:text-[34px] md:text-[40px]"
              style={{ fontFamily: '"Playfair Display", ui-serif, Georgia, serif' }}
            >
              Services
            </h1>
            <p className="text-foreground/80 mt-2 text-sm sm:text-base">
              Luxury bridal makeup, modern soft glam, and on-location artistry across San Diego, OC,
              and Los Angeles.
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

          <div className="mt-6" />
        </div>
      </div>
    </main>
  );
}

function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="border-border/60 bg-card/70 text-foreground/80 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium">
      {children}
    </span>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h4 className="text-foreground/60 mt-4 text-[11px] font-semibold tracking-[0.18em] uppercase">
      {children}
    </h4>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const booking = useBooking();
  const ref = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [glow, setGlow] = useState({ x: 50, y: 50 });

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width;
    const py = y / rect.height;
    const MAX = 6;
    const ry = (px - 0.5) * (MAX * 2);
    const rx = -(py - 0.5) * (MAX * 2);
    setTilt({ rx, ry });
    setGlow({ x: Math.round(px * 100), y: Math.round(py * 100) });
  }

  function onLeave() {
    setTilt({ rx: 0, ry: 0 });
    setGlow({ x: 50, y: 50 });
  }

  function book() {
    booking.open({ id: service.id, title: service.title });
  }

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      book();
    }
  }

  return (
    <article
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={`Send inquiry for ${service.title}`}
      onClick={book}
      onKeyDown={onKey}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group border-border focus-visible:ring-primary/60 relative h-full min-h-[480px] cursor-pointer overflow-hidden rounded-2xl border p-5 transition-transform will-change-transform outline-none [transform-style:preserve-3d] focus-visible:ring-2 sm:p-6 md:p-7"
      style={{
        background: 'color-mix(in oklab, var(--card) 60%, transparent)',
        backdropFilter: 'blur(18px) saturate(120%)',
        WebkitBackdropFilter: 'blur(18px) saturate(120%)',
        boxShadow:
          '0 16px 44px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.20)',
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
      }}
    >
      {/* sheen + glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)',
          transform: 'translateX(-60%)',
          animation: 'sheen-scan 1200ms ease-out forwards',
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(220px 220px at ${glow.x}% ${glow.y}%, rgba(255,255,255,0.10), transparent 60%)`,
          mixBlendMode: 'screen',
        }}
      />

      {/* content column */}
      <div className="relative z-10 flex h-full flex-col text-center">
        <h3 className="text-lg font-semibold tracking-tight md:text-xl">
          {service.emoji ? <span className="mr-1.5">{service.emoji}</span> : null}
          {service.title}
        </h3>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <Pill>{service.serviceLine}</Pill>
          <Pill>{service.duration}</Pill>
          {service.rate ? <Pill>{service.rate}</Pill> : null}
        </div>

        <div className="bg-border/70 mx-auto my-4 h-px w-16" />

        <SectionTitle>Includes</SectionTitle>
        <ul className="text-foreground/80 mx-auto mt-2 max-w-[46ch] space-y-1.5 text-left text-sm">
          {service.includes.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="bg-accent mt-[7px] size-[6px] rounded-full" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {service.addons?.length ? (
          <>
            <div className="bg-border/50 mx-auto my-4 h-px w-10" />
            <SectionTitle>Optional add-ons</SectionTitle>
            <ul className="text-foreground/70 mx-auto mt-2 max-w-[46ch] space-y-1.5 text-left text-sm">
              {service.addons.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="bg-border/80 mt-[7px] size-[6px] rounded-full" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {/* subtle pill CTA at the very bottom (decorative, card handles click) */}
        <div aria-hidden className="pointer-events-none mt-auto pt-5">
          <span className="border-border/60 bg-card/70 text-foreground/80 group-hover:bg-accent/10 group-hover:text-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium tracking-[0.18em] uppercase shadow-[inset_0_1px_rgba(255,255,255,.14)] backdrop-blur-sm transition-colors duration-200 select-none">
            Send inquiry
            <svg
              className="h-3.5 w-3.5 opacity-70 transition-transform duration-200 group-hover:translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </article>
  );
}

const style = `
@keyframes sheen-scan {
  0% { transform: translateX(-60%); }
  100% { transform: translateX(120%); }
}
`;

if (typeof document !== 'undefined' && !document.getElementById('services-sheen-kf')) {
  const el = document.createElement('style');
  el.id = 'services-sheen-kf';
  el.textContent = style;
  document.head.appendChild(el);
}
