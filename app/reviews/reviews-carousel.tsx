'use client';

import { useEffect, useMemo, useState } from 'react';

export type ReviewDisplay = {
  id: string;
  name: string;
  service: string;
  rating: number;
  highlight: string;
};

type Props = {
  reviews: ReviewDisplay[];
};

const INTERVAL_MS = 6000;

export default function ReviewsCarousel({ reviews }: Props) {
  const slides = useMemo(() => reviews.slice(0, 12), [reviews]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  const active = slides[index];

  if (!active) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/4 px-6 py-10 text-center text-white/70">
        Reviews will appear here soon.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-[24px] border border-white/15 bg-white/8 px-6 py-10 shadow-[0_22px_60px_rgba(0,0,0,0.28)] backdrop-blur md:px-10 md:py-12">
        <div className="flex flex-col gap-4 text-left">
          <div className="flex items-center gap-4">
            <div className="text-3xl">“</div>
            <div className="flex items-center gap-1 text-amber-300">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} aria-hidden className={i < active.rating ? 'opacity-100' : 'opacity-30'}>
                  ★
                </span>
              ))}
              <span className="sr-only">{active.rating} star review</span>
            </div>
          </div>
          <p className="text-lg leading-relaxed text-white/90 md:text-xl">{active.highlight}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/70">
            <span className="font-semibold text-white">{active.name}</span>
            <span className="h-[1px] w-6 bg-white/30" aria-hidden />
            <span>{active.service}</span>
          </div>
        </div>
      </div>

      {slides.length > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-2">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? 'w-8 bg-white' : 'w-2.5 bg-white/30 hover:bg-white/60'
              }`}
              aria-label={`Show review ${i + 1}`}
              aria-pressed={i === index}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
