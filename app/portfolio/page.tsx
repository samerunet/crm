// app/portfolio/page.tsx
"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

const PHOTOS: { src: string; alt: string }[] = [
  { src: "/portfolio/IMG_7267.JPG", alt: "San Diego bridal makeup — soft glam (IMG_7267)" },
  { src: "/portfolio/IMG_8397.JPG", alt: "Luxury bridal makeup — modern neutral glam (IMG_8397)" },
  { src: "/portfolio/IMG_4266.JPG", alt: "Bridal makeup with soft shimmer eye (IMG_4266)" },
  { src: "/portfolio/IMG_3969.JPG", alt: "Classic bridal look with nude lip (IMG_3969)" },
  { src: "/portfolio/IMG_6103.JPG", alt: "Editorial bridal glam — bronze tones (IMG_6103)" },
  { src: "/portfolio/Facetune_09-09-2023-11-55-20.JPG", alt: "Retouched bridal portrait — soft glow (Facetune)" },
  { src: "/portfolio/IMG_6746.JPG", alt: "Romantic bridal glam — rose undertones (IMG_6746)" },
  { src: "/portfolio/IMG_1866.JPG", alt: "Natural bridal makeup — dewy skin (IMG_1866)" },
  { src: "/portfolio/IMG_3878.JPG", alt: "Soft glam bridal makeup — lash focus (IMG_3878)" },
  { src: "/portfolio/IMG_3256.JPG", alt: "Elegant bridal makeup — classic liner (IMG_3256)" },
  { src: "/portfolio/IMG_5347.JPG", alt: "Modern bridal glam — bronzed glow (IMG_5347)" },
  { src: "/portfolio/IMG_7230.JPG", alt: "Bridal look with soft matte finish (IMG_7230)" },
];

export default function PortfolioPage() {
  const [idx, setIdx] = useState<number | null>(null);

  const close = useCallback(() => setIdx(null), []);
  const next = useCallback(() => setIdx((i) => (i === null ? 0 : (i + 1) % PHOTOS.length)), []);
  const prev = useCallback(() => setIdx((i) => (i === null ? 0 : (i - 1 + PHOTOS.length) % PHOTOS.length)), []);

  // Desktop keyboard shortcuts
  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [idx, close, next, prev]);

  // Mobile swipe
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    const THRESHOLD = 40;
    if (dx > THRESHOLD) prev();
    if (dx < -THRESHOLD) next();
  };

  return (
    <main className="f-container py-10 md:py-14">
      {/* Header */}
      <header className="mb-6 md:mb-8">
        <h1
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight"
          style={{ fontFamily: `"Playfair Display", ui-serif, Georgia, serif` }}
        >
          Portfolio
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Bridal, glam, and editorial looks that photograph beautifully in both natural light and flash.
        </p>
      </header>

      {/* Grid (liquid glass shell) */}
      <section className="specular glass-2 rounded-2xl p-3 sm:p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-4">
          {PHOTOS.map((p, i) => (
            <button
              key={p.src}
              type="button"
              onClick={() => setIdx(i)}
              className="group relative overflow-hidden rounded-xl border border-border bg-card/70 shadow-sm transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[--ring]"
              aria-label={`Open ${p.alt}`}
            >
              <div className="relative aspect-square">
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform group-hover:scale-[1.03]"
                  priority={i < 8}
                  quality={85}
                />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* LIGHTBOX — mobile 70%, desktop bigger; backdrop click closes; desktop arrows; mobile swipe */}
      {idx !== null && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Click outside to close */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} aria-label="Close lightbox" />

          <div
            className="
              glass specular relative z-10
              w-[70vw] h-[70vh]                 /* mobile: 70% of screen */
              md:w-[min(70vw,1100px)] md:h-[80vh] /* desktop: larger */
              rounded-2xl p-2
            "
          >
            {/* Close */}
            <button
              onClick={close}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 rounded-lg border border-border bg-card/80 px-2.5 py-1 text-sm hover:bg-accent/15"
            >
              ✕
            </button>

            {/* Desktop-only arrows */}
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              aria-label="Previous"
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 h-11 w-11 items-center justify-center rounded-full border border-border bg-card/80 text-base font-medium backdrop-blur hover:bg-accent/20"
            >
              ‹
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              aria-label="Next"
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 h-11 w-11 items-center justify-center rounded-full border border-border bg-card/80 text-base font-medium backdrop-blur hover:bg-accent/20"
            >
              ›
            </button>

            {/* Image + swipe handlers */}
            <div className="relative w-full h-full" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <Image
                src={PHOTOS[idx].src}
                alt={PHOTOS[idx].alt}
                fill
                className="object-contain"
                sizes="70vw"
                priority
                quality={90}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
