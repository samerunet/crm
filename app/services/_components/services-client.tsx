'use client';

import { useRef, useState, type MouseEvent } from 'react';

import { useBooking } from '@/components/ui/booking-provider';

type Service = {
  id: string;
  title: string;
  blurb: string;
  features: string[];
};

const SERVICES: Service[] = [
  {
    id: 'bridal-day',
    title: 'Bridal Day-Of Makeup',
    blurb: 'Long-wear, photo-perfect complexion with soft glam finishing.',
    features: ['Skin prep & lashes', 'Touch-up kit', 'On-location available'],
  },
  {
    id: 'bridal-trial',
    title: 'Bridal Trial',
    blurb: 'Dial in your exact wedding-day look with before/after photos.',
    features: ['Look planning', 'Product mapping', 'Photography test'],
  },
  {
    id: 'bridal-party',
    title: 'Bridesmaids / Party',
    blurb: 'Cohesive glam that photographs beautifully as a group.',
    features: ['Coordinated palette', 'Lashes included', 'Fast & polished'],
  },
  {
    id: 'events-glam',
    title: 'Special Events Glam',
    blurb: 'Soft to full glam for showers, engagements, and nights out.',
    features: ['Event-ready wear', 'Customized intensity', 'Optional hair partner'],
  },
  {
    id: 'editorial',
    title: 'Editorial / Photoshoot',
    blurb: 'Modern, camera-ready looks for studio or on-location shoots.',
    features: ['Creative direction', 'On-set touch-ups', 'Half-day / full-day'],
  },
  {
    id: 'lessons',
    title: 'Private Lessons',
    blurb: 'Hands-on technique session tailored to your features & kit.',
    features: ['Face chart', 'Kit audit', 'Step-by-step routine'],
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
          <header className="mb-4 sm:mb-6">
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

  return (
    <article
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group border-border relative overflow-hidden rounded-2xl border p-5 transition-transform will-change-transform [transform-style:preserve-3d] sm:p-6 md:p-7"
      style={{
        background: 'color-mix(in oklab, var(--card) 60%, transparent)',
        backdropFilter: 'blur(18px) saturate(120%)',
        WebkitBackdropFilter: 'blur(18px) saturate(120%)',
        boxShadow:
          '0 16px 44px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.20)',
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
      }}
    >
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

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,.20), rgba(255,255,255,0) 40%) top/100% 60% no-repeat',
          mixBlendMode: 'screen',
        }}
      />

      <h3 className="relative z-10 text-lg font-semibold tracking-tight md:text-xl">
        {service.title}
      </h3>
      <p className="text-foreground/85 relative z-10 mt-1 text-sm">{service.blurb}</p>

      <ul className="text-foreground/75 relative z-10 mt-3 space-y-1.5 text-sm">
        {service.features.map((feature) => (
          <li key={feature} className="flex gap-2">
            <span className="bg-accent mt-[7px] size-[6px] rounded-full" />
            {feature}
          </li>
        ))}
      </ul>

      <div className="relative z-10 mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => booking.open({ id: service.id, title: service.title })}
          className="bg-primary text-primary-foreground rounded-xl px-4 py-2 text-sm font-medium shadow transition-transform hover:scale-[1.02] active:scale-[0.99]"
          style={{ boxShadow: '0 14px 34px rgba(0,0,0,0.24)' }}
        >
          Book Now
        </button>
        <a
          href="/portfolio"
          className="border-border bg-card/60 hover:bg-accent/15 rounded-xl border px-4 py-2 text-sm font-medium backdrop-blur transition-colors"
        >
          View Work
        </a>
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
