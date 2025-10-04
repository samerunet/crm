// app/services/page.tsx
"use client";

import { useBooking } from "@/components/ui/booking-provider";
import { useRef, useState } from "react";

type Service = {
  id: string;
  title: string;
  blurb: string;
  features: string[];
};

const SERVICES: Service[] = [
  {
    id: "bridal-day",
    title: "Bridal Day-Of Makeup",
    blurb: "Long-wear, photo-perfect complexion with soft glam finishing.",
    features: ["Skin prep & lashes", "Touch-up kit", "On-location available"],
  },
  {
    id: "bridal-trial",
    title: "Bridal Trial",
    blurb: "Dial in your exact wedding-day look with before/after photos.",
    features: ["Look planning", "Product mapping", "Photography test"],
  },
  {
    id: "bridal-party",
    title: "Bridesmaids / Party",
    blurb: "Cohesive glam that photographs beautifully as a group.",
    features: ["Coordinated palette", "Lashes included", "Fast & polished"],
  },
  {
    id: "events-glam",
    title: "Special Events Glam",
    blurb: "Soft to full glam for showers, engagements, and nights out.",
    features: ["Event-ready wear", "Customized intensity", "Optional hair partner"],
  },
  {
    id: "editorial",
    title: "Editorial / Photoshoot",
    blurb: "Modern, camera-ready looks for studio or on-location shoots.",
    features: ["Creative direction", "On-set touch-ups", "Half-day / full-day"],
  },
  {
    id: "lessons",
    title: "Private Lessons",
    blurb: "Hands-on technique session tailored to your features & kit.",
    features: ["Face chart", "Kit audit", "Step-by-step routine"],
  },
];

export default function ServicesPage() {
  return (
    <main className="relative f-container py-6 md:py-10">
      {/* backdrop glow to match the site */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-x-0 -top-20 h-[140px] opacity-60 blur-2xl md:h-[180px]"
          style={{ background: "radial-gradient(60% 60% at 50% 0%, rgba(176,137,104,.30), transparent 70%)" }}
        />
      </div>

      {/* outer shell (same width treatment as hero/about) */}
      <div className="specular glass-2 overflow-hidden rounded-[22px] md:rounded-[28px] -mx-3 sm:-mx-6">
        <div className="p-4 sm:p-6 md:p-8">
          <header className="mb-4 sm:mb-6">
            <h1
              className="font-serif text-[28px] sm:text-[34px] md:text-[40px] font-semibold tracking-tight"
              style={{ fontFamily: `"Playfair Display", ui-serif, Georgia, serif` }}
            >
              Services
            </h1>
            <p className="mt-2 text-sm sm:text-base text-foreground/80">
              Luxury bridal makeup, modern soft glam, and on-location artistry across San Diego, OC, and Los Angeles.
            </p>
          </header>

          {/* Larger cards on desktop */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>

          <div className="mt-6" />
        </div>
      </div>
    </main>
  );
}

/* ---------------- iOS-style Liquid Glass Card ---------------- */

function ServiceCard({ service }: { service: Service }) {
  const booking = useBooking();
  const ref = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [glow, setGlow] = useState({ x: 50, y: 50 }); // % for radial-gradient anchor

  // mouse-move parallax/tilt + glow anchor
  function onMove(e: React.MouseEvent) {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // px inside
    const y = e.clientY - rect.top;
    const px = x / rect.width; // 0..1
    const py = y / rect.height;

    // tilt ranges (smaller = subtler)
    const MAX = 6; // degrees
    const ry = (px - 0.5) * (MAX * 2); // rotateY
    const rx = -(py - 0.5) * (MAX * 2); // rotateX
    setTilt({ rx, ry });

    // glow anchor as percentages
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
      className="
        group relative overflow-hidden rounded-2xl border border-border
        p-5 sm:p-6 md:p-7
        transition-transform [transform-style:preserve-3d] will-change-transform
      "
      style={{
        // liquid-glass base using your CSS vars
        background:
          "color-mix(in oklab, var(--card) 60%, transparent)",
        backdropFilter: "blur(18px) saturate(120%)",
        WebkitBackdropFilter: "blur(18px) saturate(120%)",
        boxShadow:
          "0 16px 44px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.20)",
        // subtle 3D tilt
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
      }}
    >
      {/* sweeping sheen (moves across on hover) */}
      <span
        aria-hidden
        className="
          pointer-events-none absolute -inset-1
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
        "
        style={{
          background:
            "linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)",
          transform: "translateX(-60%)",
          animation: "sheen-scan 1200ms ease-out forwards",
          // restart animation per hover by scoping to .group:hover
        }}
      />

      {/* liquid fill glow following cursor */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
        style={{
          background: `radial-gradient(220px 220px at ${glow.x}% ${glow.y}%, rgba(255,255,255,0.10), transparent 60%)`,
          mixBlendMode: "screen",
        }}
      />

      {/* inner hairline highlight (specular) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,.20), rgba(255,255,255,0) 40%) top/100% 60% no-repeat",
          mixBlendMode: "screen",
        }}
      />

      <h3 className="relative z-10 text-lg md:text-xl font-semibold tracking-tight">
        {service.title}
      </h3>
      <p className="relative z-10 mt-1 text-sm text-foreground/85">{service.blurb}</p>

      <ul className="relative z-10 mt-3 space-y-1.5 text-sm text-foreground/75">
        {service.features.map((f) => (
          <li key={f} className="flex gap-2">
            <span className="mt-[7px] size-[6px] rounded-full bg-accent" />
            {f}
          </li>
        ))}
      </ul>

      <div className="relative z-10 mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => booking.open({ id: service.id, title: service.title })}
          className="
            rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground
            transition-transform hover:scale-[1.02] active:scale-[0.99]
            shadow
          "
          style={{ boxShadow: "0 14px 34px rgba(0,0,0,0.24)" }}
        >
          Book Now
        </button>
        <a
          href="/portfolio"
          className="
            rounded-xl border border-border bg-card/60 px-4 py-2 text-sm font-medium
            backdrop-blur hover:bg-accent/15 transition-colors
          "
        >
          View Work
        </a>
      </div>
    </article>
  );
}

/* Keyframes (in-file injection for sheen) */
const style = `
@keyframes sheen-scan {
  0% { transform: translateX(-60%); }
  100% { transform: translateX(120%); }
}
`;
if (typeof document !== "undefined" && !document.getElementById("services-sheen-kf")) {
  const el = document.createElement("style");
  el.id = "services-sheen-kf";
  el.textContent = style;
  document.head.appendChild(el);
}
