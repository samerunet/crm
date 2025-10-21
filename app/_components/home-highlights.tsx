'use client';
import { ReactNode } from 'react';

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 p-5 sm:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.14) 50%, transparent 70%)',
          transform: 'translateX(-60%)',
          animation: 'sheen-scan 1200ms ease-out forwards',
        }}
      />
      <h3 className="text-base font-semibold tracking-tight">{title}</h3>
      <p className="text-foreground/80 mt-2 text-sm leading-relaxed">{children}</p>
    </article>
  );
}

export default function HomeHighlights() {
  return (
    <section id="highlights" className="f-container mt-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Luxury, Camera-Ready Skin">
          Skin prep that photographs beautifully and lasts. Thoughtful product selection for every skin type and tone—refined, never heavy.
        </Card>
        <Card title="Bridal & Soft Glam Expertise">
          From natural bridal to elevated soft glam, looks are tailored to features, lighting, and timeline—calm mornings, flawless results.
        </Card>
        <Card title="On-Location & Studio">
          Available across San Diego, OC, and LA. In-studio appointments or full on-site teams for weddings, events, and photoshoots.
        </Card>
        <Card title="Timelines & Trials, Done Right">
          Clear communication, efficient schedules, and optional trials. We handle the details so you can enjoy the day.
        </Card>
      </div>
    </section>
  );
}
