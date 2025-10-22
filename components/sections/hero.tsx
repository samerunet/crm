// components/sections/hero.tsx
"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";

const LOOKBOOK: { src: string; alt: string }[] = [
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

export default function HeroLanding() {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const close = useCallback(() => setLightboxIdx(null), []);
  const next = useCallback(() => setLightboxIdx(i => (i === null ? 0 : (i + 1) % LOOKBOOK.length)), []);
  const prev = useCallback(() => setLightboxIdx(i => (i === null ? 0 : (i - 1 + LOOKBOOK.length) % LOOKBOOK.length)), []);

  // keyboard (desktop)
  useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxIdx, close, next, prev]);

  // swipe (mobile)
  const touchStartX = useRef<number | null>(null);
  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => (touchStartX.current = e.changedTouches[0].clientX);
  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    const T = 40;
    if (dx > T) prev();
    if (dx < -T) next();
  };

  return (
    <section className="relative f-container pt-4 pb-24 md:pb-12">
      {/* soft backdrop glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-x-0 -top-20 h-[140px] opacity-60 blur-2xl md:h-[180px]"
          style={{ background: "radial-gradient(60% 60% at 50% 0%, rgba(176,137,104,.30), transparent 70%)" }}
        />
      </div>

      {/* OUTER SHELL — same as other sections */}
      <div className="specular glass-2 overflow-hidden rounded-[22px] md:rounded-[28px] -mx-3 sm:-mx-6">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="specular glass rounded-[16px] p-5 sm:p-6 md:p-7 md:rounded-[20px]">
            <h2
              className="font-serif text-[26px] sm:text-[30px] md:text-[36px] font-semibold tracking-tight"
              style={{ fontFamily: `"Playfair Display", ui-serif, Georgia, serif` }}
            >
              Lookbook
            </h2>

            {/* Responsive gallery: 2 → 3 → 4 cols */}
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
              {LOOKBOOK.map((img, i) => (
                <button
                  key={i}
                  aria-label={`Open ${img.alt}`}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card/70 shadow-sm transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[--ring]"
                  onClick={() => setLightboxIdx(i)}
                >
                  <div className="relative aspect-square">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform group-hover:scale-[1.03]"
                  priority={i === 0}
                />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LIGHTBOX */}
      {lightboxIdx !== null && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />

          <div className="glass specular relative z-10 w-[70vw] h-[70vh] md:w-[min(70vw,1100px)] md:h-[80vh] rounded-2xl p-2">
            {/* desktop arrows */}
            <button
              onClick={e => { e.stopPropagation(); prev(); }}
              aria-label="Previous"
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-10 h-11 w-11 items-center justify-center rounded-full border border-border bg-card/80 backdrop-blur hover:bg-accent/20"
            >
              ‹
            </button>
            <button
              onClick={e => { e.stopPropagation(); next(); }}
              aria-label="Next"
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-10 h-11 w-11 items-center justify-center rounded-full border border-border bg-card/80 backdrop-blur hover:bg-accent/20"
            >
              ›
            </button>

            <button
              onClick={close}
              aria-label="Close"
              className="absolute right-3 top-3 z-10 rounded-lg border border-border bg-card/80 px-2.5 py-1 text-sm hover:bg-accent/15"
            >
              ✕
            </button>

            <div className="relative w-full h-full" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <Image
                src={LOOKBOOK[lightboxIdx].src}
                alt={LOOKBOOK[lightboxIdx].alt}
                fill
                className="object-contain"
                sizes="70vw"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
