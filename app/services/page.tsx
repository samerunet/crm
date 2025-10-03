// app/services/page.tsx
"use client";

import type { Metadata } from "next";
import { useState } from "react";
import BookingModal from "@/components/ui/booking-modal";



type CardProps = { id: string; title: string; desc: string; meta: string; cta: string; };

const ADD_ONS = [
  { id: "touchups", label: "On-site touch-ups", price: "Hourly" },
  { id: "earlystart", label: "Early start / Before 7am" },
  { id: "travel", label: "Travel / Destination" },
  { id: "airbrush", label: "Airbrush finish" },
  { id: "trial2", label: "Second trial" },
];

const SERVICES: CardProps[] = [
  { id: "trial", title: "Bridal Trial", desc: "Consultation + custom look, skin prep, lashes.", meta: "60–90 min", cta: "Book Trial" },
  { id: "bride", title: "Wedding Day — Bride", desc: "Photo-ready glam, tailored to your trial.", meta: "On-site", cta: "Check Availability" },
  { id: "party", title: "Bridal Party & Mothers", desc: "Soft glam that complements the bride’s look.", meta: "Per person", cta: "Inquire" },
  { id: "touchup", title: "Touch-Ups / Stay-Through", desc: "On-site maintenance for portraits, ceremony, reception.", meta: "Hourly / Package", cta: "Add On" },
  { id: "events", title: "Special Events", desc: "Engagement, shower, photoshoot, gala.", meta: "Studio / On-site", cta: "Book Now" },
  { id: "lessons", title: "Lessons & Education", desc: "Private lessons & pro education.", meta: "1:1 / Small Group", cta: "Request Info" },
];

function ServiceCard({ item, onBook }: { item: CardProps; onBook: (id: string) => void }) {
  return (
    <article className={["group relative overflow-hidden rounded-2xl p-5 shadow","glass specular transition-all duration-300 ease-out","hover:-translate-y-1 hover:shadow-[0_16px_60px_rgba(0,0,0,0.18)] hover:bg-card/70 hover:border-border/80","transform-gpu will-change-transform"].join(" ")}>
      <div aria-hidden className="pointer-events-none absolute -top-1 -left-[30%] h-[140%] w-[30%] rotate-12 bg-white/10 blur-md transition-transform duration-700 ease-out group-hover:translate-x-[260%]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[20px] opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,.28), inset 0 -1px 0 rgba(0,0,0,.06)" }} />
      <h2 className="text-lg font-semibold">{item.title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-medium opacity-80">{item.meta}</span>
        <button onClick={() => onBook(item.id)} className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent">
          {item.cta}
        </button>
      </div>
    </article>
  );
}

export default function ServicesPage() {
  const [open, setOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<{ id: string; title: string } | null>(null);

  const onBook = (id: string) => {
    const svc = SERVICES.find((s) => s.id === id);
    if (!svc) return;
    setSelectedService({ id: svc.id, title: svc.title });
    setOpen(true);
  };

  return (
    <main className="mx-auto w-full max-w-6xl lg:max-w-[86rem] px-4 sm:px-6 py-10">
      <header className="mb-6 sm:mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight" style={{ fontFamily: `"Playfair Display", ui-serif, Georgia, serif` }}>
          Services
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">Bridal-focused, camera-ready looks that last from first look to last dance.</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <ServiceCard key={s.id} item={s} onBook={onBook} />
        ))}
      </section>

      <div className="mt-8 glass specular rounded-2xl p-4 sm:p-5 text-sm text-muted-foreground">
        Serving <strong>San Diego</strong>, <strong>Orange County</strong>, and <strong>Los Angeles</strong>. Destination & travel available upon request. Minimums may apply for on-site bookings.
      </div>

      <BookingModal open={open} onClose={() => setOpen(false)} service={selectedService ?? undefined} addOns={ADD_ONS} />
    </main>
  );
}
