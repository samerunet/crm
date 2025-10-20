// FILE: components/sections/about.tsx  (DROP-IN: banner is separate above image)
"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import BookingBanner from "@/components/sections/booking-banner";
import ServiceModal from "./service-modal";

const CATEGORIES = [
  { label: "Bridal Makeup", img: "/portfolio/IMG_5347.JPG" },
  { label: "Editorial / Fashion", img: "/portfolio/IMG_6103.JPG" },
  { label: "Destination Wedding", img: "/portfolio/IMG_3256.JPG" },
  { label: "Studio Appointment", img: "/portfolio/IMG_1866.JPG" },
];

export default function AboutSection() {
  const [modal, setModal] = useState<{
    title: string;
    img: string;
    body: ReactNode;
  } | null>(null);

  return (
    <section className="relative f-container py-6 md:py-10">
      {/* Title ABOVE everything */}
      <header className="mb-3 sm:mb-4">
        {/* <h1
          className="font-serif text-[28px] sm:text-[34px] md:text-[40px] font-semibold tracking-tight"
          style={{ fontFamily: `"Playfair Display", ui-serif, Georgia, serif` }}
        >
          About Fari
        </h1> */}
      </header>

      {/* GOLD HEADLINE BANNER — STANDALONE (separate box, not over image) */}
      <div className="mb-3 sm:mb-4">
        <BookingBanner
          align="left"
          glassOpacity={5}                 // ~95% transparent
          showCTA={false}                  // keep this strip clean
          subline="San Diego • Orange County • Los Angeles • Destination"
          className="w-full"
        />
      </div>

      {/* OUTER HERO FRAME (image only inside) */}
      <div className="specular glass-2 overflow-hidden rounded-[24px] border border-border/70">
        {/* HERO IMAGE */}
        <div className="relative h-[62vh] min-h-[520px] md:h-[640px]">
          <Image
            src="/portfolio/12.JPG" // ensure this exists in /public/portfolio
            alt="Luxury bridal makeup — soft, skin-focused glam"
            fill
            priority
            quality={90}
            className="object-cover"
            style={{ objectPosition: "50% 35%" }}
            sizes="100vw"
          />
          {/* subtle tint for readability (kept, but no text overlay anymore) */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,.10), rgba(0,0,0,0) 30%, rgba(0,0,0,.18) 100%)",
              mixBlendMode: "multiply",
            }}
          />
        </div>

        {/* CATEGORY STRIP */}
        <div className="border-t border-border/60 bg-card/60 px-4 py-5 backdrop-blur sm:px-6 md:px-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CATEGORIES.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() =>
                  setModal({
                    title: c.label,
                    img: c.img,
                    body: (
                      <>
                        <p>
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Curabitur a sapien vitae urna facilisis
                          faucibus. Cras vitae luctus nunc.
                        </p>
                        <ul className="mt-3 list-disc space-y-1 pl-5">
                          <li>Skin-first, modern soft glam.</li>
                          <li>Timeline-friendly, on-location.</li>
                          <li>Touch-ups and add-ons available.</li>
                        </ul>
                      </>
                    ),
                  })
                }
                className="group rounded-2xl border border-border/70 bg-background/40 p-2 text-left shadow-sm transition hover:bg-accent/10"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <Image
                    src={c.img}
                    alt={c.label}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 50vw, 25vw"
                    quality={85}
                  />
                </div>
                <div className="mt-2 rounded-lg bg-card/85 px-3 py-2 text-center text-[13px] font-medium backdrop-blur">
                  {c.label}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      {modal && (
        <ServiceModal
          open={!!modal}
          onClose={() => setModal(null)}
          title={modal.title}
          image={modal.img}
        >
          {modal.body}
        </ServiceModal>
      )}
    </section>
  );
}
