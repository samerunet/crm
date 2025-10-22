'use client';
import { ReactNode } from 'react';

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="group border-border/60 bg-card/70 relative overflow-hidden rounded-2xl border p-5 sm:p-6">
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
    <section
      id="highlights"
      className="f-container mt-12 mb-12 sm:mt-14 sm:mb-16 md:mt-16 md:mb-20"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Camera-ready skin">
          Long-wear, comfort-first glam tailored to your skin, tone, and signature style.
        </Card>
        <Card title="On-location or studio">
          Mobile artistry for weddings, events, and shoots across San Diego, Orange County, and Los Angeles.
        </Card>
        <Card title="Calm, timed mornings">
          Bridal timelines that stay on schedule without rush—coordinated with your planner and photographer.
        </Card>
        <Card title="Inclusive artistry">
          Expertise across every skin tone, eye shape, and maternity skin for looks that feel like you.
        </Card>
      </div>
    </section>
  );
}
