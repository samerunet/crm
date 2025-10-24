'use client';

import { useEffect, useMemo, useState } from 'react';
import { useBooking } from '@/components/ui/booking-provider';

type Highlight = {
  title: string;
  summary: string;
  detail: string[];
};

const HIGHLIGHTS: Highlight[] = [
  {
    title: 'Effortless, camera-ready beauty',
    summary:
      'Luxury makeup that enhances your natural features. From soft, glowing skin to full glam – every look is tailored to you.',
    detail: [
      'Luxury makeup that enhances your natural features. From soft, glowing skin to full glam – every look is tailored to you.',
    ],
  },
  {
    title: 'Studio or On-Location',
    summary:
      'Based in San Diego with a private studio, travel across Orange County, Los Angeles, and beyond. Destination weddings and events throughout California, Europe.',
    detail: [
      'Based in San Diego with a private studio, travel across Orange County, Los Angeles, and beyond.',
      'Destination weddings and events throughout California, Europe.',
    ],
  },
  {
    title: 'Inclusive, timeless artistry',
    summary:
      'With years of international education and experience working on diverse faces, I customize each look to enhance your individuality.',
    detail: [
      'With years of international education and experience working on diverse faces, I customize each look to enhance your individuality.',
    ],
  },
  {
    title: 'Seamless mornings',
    summary:
      'Working with my professional hairstylist partner, we create a seamless and luxury beauty experience.',
    detail: [
      'Working with my professional hairstylist partner, we create a seamless and luxury beauty experience.',
    ],
  },
];

function HighlightCard({ highlight, onOpen }: { highlight: Highlight; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group border-border/60 bg-card/70 focus-visible:ring-primary/60 relative block h-full transform overflow-hidden rounded-2xl border p-5 text-left transition-transform hover:-translate-y-0.5 hover:shadow-lg focus-visible:ring-2 focus-visible:outline-none sm:p-6"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.14) 50%, transparent 70%)',
          transform: 'translateX(-60%)',
          animation: 'sheen-scan 1200ms ease-out forwards',
        }}
      />
      <span className="relative flex h-full flex-col">
        <h3 className="text-base font-semibold tracking-tight">{highlight.title}</h3>
        <p className="text-foreground/80 mt-2 flex-1 text-sm leading-relaxed">
          {highlight.summary}
        </p>
      </span>
    </button>
  );
}

function HighlightDialog({
  highlight,
  onClose,
  onBook,
}: {
  highlight: Highlight;
  onClose: () => void;
  onBook: () => void;
}) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={highlight.title}
          className="glass-2 specular border-border/70 bg-card/95 relative w-full max-w-2xl rounded-2xl border p-6 shadow-[0_24px_70px_rgba(0,0,0,0.32)]"
        >
          <button
            type="button"
            onClick={onClose}
            className="border-border/70 bg-card/80 hover:bg-accent/20 focus-visible:ring-primary/60 absolute top-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold transition focus-visible:ring-2 focus-visible:outline-none"
            aria-label="Close highlight"
          >
            ✕
          </button>
          <div className="pr-10">
            <h3 className="text-lg font-semibold tracking-tight sm:text-xl">{highlight.title}</h3>
            <div className="text-foreground/90 mt-3 space-y-3 text-sm leading-6">
              {highlight.detail.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onBook}
                className="gbtn specular focus-visible:ring-primary/60 inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:outline-none active:scale-[0.99]"
              >
                Book now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomeHighlights() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const booking = useBooking();
  const activeHighlight = useMemo(
    () => (activeIndex !== null ? HIGHLIGHTS[activeIndex] : null),
    [activeIndex],
  );

  return (
    <section
      id="highlights"
      className="f-container mt-12 mb-12 sm:mt-14 sm:mb-16 md:mt-16 md:mb-20"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {HIGHLIGHTS.map((highlight, index) => (
          <HighlightCard
            key={highlight.title}
            highlight={highlight}
            onOpen={() => setActiveIndex(index)}
          />
        ))}
      </div>
      {activeHighlight ? (
        <HighlightDialog
          highlight={activeHighlight}
          onClose={() => setActiveIndex(null)}
          onBook={() => {
            booking.open();
            setActiveIndex(null);
          }}
        />
      ) : null}
    </section>
  );
}
