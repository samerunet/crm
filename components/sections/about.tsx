// FILE: components/sections/about.tsx
'use client';

import Image from 'next/image';
import BookingBanner from '@/components/sections/booking-banner';

const PHOTOS = [
  { label: 'Bridal Makeup', img: '/portfolio/IMG_5347.JPG' },
  { label: 'Editorial / Fashion', img: '/portfolio/IMG_9791.jpg' },
  { label: 'Destination Wedding', img: '/portfolio/IMG_3547.jpg' },
  { label: 'Studio Appointment', img: '/portfolio/IMG_3750.jpg' },
];

// Tiny warm unify tint (≈6%). Tweak alpha 0.04–0.08 to taste.
// Swap rgba for neutral/cool if preferred.
const TINT_CLASS =
  'after:content-[""] after:absolute after:inset-0 after:pointer-events-none after:bg-[rgba(250,244,234,0.06)] after:mix-blend-normal sm:after:mix-blend-multiply';

const HERO_BLUR =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMScgaGVpZ2h0PScxJyBmaWxsPSdub25lJyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPScxJyBoZWlnaHQ9JzEnIGZpbGw9IiNDQkI5QTQiLz48L3N2Zz4=';

export default function AboutSection() {
  return (
    <section className="f-container relative py-6 md:py-10">
      {/* spacer header (intentionally empty) */}
      <header className="mb-3 sm:mb-4" />

      {/* GOLD HEADLINE BANNER — standalone */}
      <div className="mb-3 sm:mb-4">
        <BookingBanner
          glassOpacity={5}
          showCTA={false}
          subline="San Diego • Orange County • Los Angeles • Destination"
          sublineClassName="text-black"
          sublineAlign="end"
          className="w-full"
        />
      </div>

      {/* HERO (static) */}
      <div
        className="relative block overflow-hidden rounded-[24px] border border-black/45 bg-[rgba(18,13,10,0.48)] shadow-[0_22px_60px_rgba(0,0,0,0.32)]"
        aria-label="Signature glam highlights"
      >
        <div className={`relative h-[62vh] min-h-[520px] md:h-[640px] ${TINT_CLASS}`}>
          <Image
            src="/portfolio/12-hero.webp"
            alt="Luxury bridal makeup — soft, skin-focused glam"
            fill
            priority
            fetchPriority="high"
            quality={65}
            placeholder="blur"
            blurDataURL={HERO_BLUR}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 1200px"
            className="object-cover"
            style={{ objectPosition: '50% 35%' }}
          />
          {/* subtle gradient for depth */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(9,6,4,0.42), rgba(9,6,4,0.12) 40%, rgba(9,6,4,0.58) 100%)',
            }}
          />
        </div>
      </div>

      {/* STATIC GALLERY */}
      <div className="border-border/60 bg-card/60 border-t px-4 py-5 backdrop-blur sm:px-6 md:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {PHOTOS.map((p) => (
            <div
              key={p.label}
              className="border-border/70 bg-background/40 rounded-2xl border p-2 shadow-sm"
            >
              <div className={`relative aspect-[4/3] overflow-hidden rounded-xl ${TINT_CLASS}`}>
                <Image
                  src={p.img}
                  alt={p.label}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 33vw"
                />
              </div>
              <div className="bg-card/85 mt-2 rounded-lg px-3 py-2 text-center text-[13px] font-medium backdrop-blur">
                {p.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
