'use client';

import Image from 'next/image';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type TouchEvent,
} from 'react';

const PHOTOS: { src: string; alt: string }[] = [
  { src: '/portfolio/IMG_7267.JPG', alt: 'San Diego bridal makeup — soft glam (IMG_7267)' },
  { src: '/portfolio/IMG_8397.JPG', alt: 'Luxury bridal makeup — modern neutral glam (IMG_8397)' },
  { src: '/portfolio/IMG_4266.JPG', alt: 'Bridal makeup with soft shimmer eye (IMG_4266)' },
  { src: '/portfolio/IMG_3969.JPG', alt: 'Classic bridal look with nude lip (IMG_3969)' },
  { src: '/portfolio/IMG_6103.JPG', alt: 'Editorial bridal glam — bronze tones (IMG_6103)' },
  {
    src: '/portfolio/Facetune_09-09-2023-11-55-20.JPG',
    alt: 'Retouched bridal portrait — soft glow (Facetune)',
  },
  { src: '/portfolio/IMG_6746.JPG', alt: 'Romantic bridal glam — rose undertones (IMG_6746)' },
  { src: '/portfolio/IMG_1866.JPG', alt: 'Natural bridal makeup — dewy skin (IMG_1866)' },
  { src: '/portfolio/IMG_3878.JPG', alt: 'Soft glam bridal makeup — lash focus (IMG_3878)' },
  { src: '/portfolio/IMG_3256.JPG', alt: 'Elegant bridal makeup — classic liner (IMG_3256)' },
  { src: '/portfolio/IMG_5347.JPG', alt: 'Modern bridal glam — bronzed glow (IMG_5347)' },
  { src: '/portfolio/IMG_7230.JPG', alt: 'Bridal look with soft matte finish (IMG_7230)' },
];

export default function PortfolioClient() {
  const [idx, setIdx] = useState<number | null>(null);

  const close = useCallback(() => setIdx(null), []);
  const next = useCallback(() => setIdx((i) => (i === null ? 0 : (i + 1) % PHOTOS.length)), []);
  const prev = useCallback(
    () => setIdx((i) => (i === null ? 0 : (i - 1 + PHOTOS.length) % PHOTOS.length)),
    [],
  );

  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [idx, close, next, prev]);

  const dragOriginX = useRef<number | null>(null);
  const pointerId = useRef<number | null>(null);

  const startSwipe = useCallback((x: number, id?: number) => {
    dragOriginX.current = x;
    if (typeof id === 'number') pointerId.current = id;
  }, []);

  const endSwipe = useCallback(
    (x: number) => {
      if (dragOriginX.current == null) return;
      const dx = x - dragOriginX.current;
      dragOriginX.current = null;
      pointerId.current = null;
      const THRESHOLD = 40;
      if (dx > THRESHOLD) prev();
      if (dx < -THRESHOLD) next();
    },
    [next, prev],
  );

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    startSwipe(e.changedTouches[0].clientX);
  };
  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    endSwipe(e.changedTouches[0].clientX);
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse') return;
    startSwipe(e.clientX, e.pointerId);
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (pointerId.current !== null && e.pointerId !== pointerId.current) return;
    endSwipe(e.clientX);
  };

  return (
    <main className="f-container py-10 md:py-14">
      <header className="mb-6 md:mb-8">
        <h1
          className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl"
          style={{ fontFamily: `"Playfair Display", ui-serif, Georgia, serif` }}
        >
          Portfolio
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Bridal, glam, and editorial looks that photograph beautifully in both natural light and
          flash.
        </p>
      </header>

      <section className="specular glass-2 rounded-2xl p-3 sm:p-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-4">
          {PHOTOS.map((p, i) => (
            <button
              key={p.src}
              type="button"
              onClick={() => setIdx(i)}
              className="group border-border bg-card/70 relative overflow-hidden rounded-xl border shadow-sm transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[--ring]"
              aria-label={`Open ${p.alt}`}
            >
              <div className="relative aspect-square">
                <Image
                  src={p.src}
                  alt={p.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform group-hover:scale-[1.03]"
                  priority={i === 0}
                />
              </div>
            </button>
          ))}
        </div>
      </section>

      {idx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={close}
            aria-label="Close lightbox"
          />

          <div
            className="glass specular relative z-10 h-[70vh] w-full max-w-[90vw] rounded-2xl p-2 md:h-[80vh] md:w-[min(70vw,1100px)]"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
          >
            <button
              onClick={close}
              aria-label="Close"
              className="border-border bg-card/80 hover:bg-accent/15 absolute top-3 right-3 z-10 rounded-lg border px-2.5 py-1 text-sm"
            >
              ✕
            </button>

            <button
              onClick={prev}
              aria-label="Previous photo"
              className="border-border bg-card/80 hover:bg-accent/15 absolute top-1/2 left-3 hidden -translate-y-1/2 rounded-full border p-3 text-lg md:grid"
            >
              ‹
            </button>

            <button
              onClick={next}
              aria-label="Next photo"
              className="border-border bg-card/80 hover:bg-accent/15 absolute top-1/2 right-3 hidden -translate-y-1/2 rounded-full border p-3 text-lg md:grid"
            >
              ›
            </button>

            <div className="relative flex h-full items-center justify-center rounded-xl bg-black/60">
              <Image
                src={PHOTOS[idx].src}
                alt={PHOTOS[idx].alt}
                fill
                sizes="(max-width: 1024px) 90vw, 70vw"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
