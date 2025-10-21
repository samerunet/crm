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

const CATEGORY_DETAILS: Record<
  string,
  { intro: string; bullets: string[] }
> = {
  "Bridal Makeup": {
    intro:
      "Tailored bridal glam designed to look flawless in person and on camera—calm, luxurious, and long-lasting.",
    bullets: [
      "Custom skin prep for every complexion",
      "Natural, soft, or full glam based on your vision",
      "Timeline support plus prep guidance for your morning",
    ],
  },
  "Editorial / Fashion": {
    intro:
      "High-impact makeup for campaigns, covers, and branding shoots—built for close-ups and studio lighting.",
    bullets: [
      "Concept collaboration with your creative team",
      "On-set touch-ups from first frame to final shot",
      "Looks crafted for photo and video retention",
    ],
  },
  "Destination Wedding": {
    intro:
      "Full-service destination makeup experiences with seamless travel coordination for you and your party.",
    bullets: [
      "Luxury bridal glam that withstands climate + celebration",
      "Makeup options for bridesmaids and family members",
      "Travel logistics, timeline planning, and touch-ups",
    ],
  },
  "Studio Appointment": {
    intro:
      "Private San Diego studio sessions perfect for portraits, maternity, special occasions, or lessons.",
    bullets: [
      "One-on-one glam with lashes included",
      "Soft glam to statement looks tailored to you",
      "Optional hairstyling and product recommendations",
    ],
  },
};

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
      <a
        href="#highlights"
        className="specular glass-2 block overflow-hidden rounded-[24px] border border-border/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        aria-label="View signature glam highlights"
      >
        {/* HERO IMAGE */}
        <div className="relative h-[62vh] min-h-[520px] md:h-[640px]">
          <Image
            src="/portfolio/12.JPG"
            alt="Luxury bridal makeup — soft, skin-focused glam"
            fill
            priority
            fetchPriority="high"
            quality={65}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 50vw"
            className="object-cover"
            style={{ objectPosition: "50% 35%" }}
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
      </a>

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
                      <p>{CATEGORY_DETAILS[c.label]?.intro}</p>
                      <ul className="mt-3 list-disc space-y-1 pl-5">
                        {CATEGORY_DETAILS[c.label]?.bullets.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
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
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 240px"
                  quality={65}
                />
              </div>
              <div className="mt-2 rounded-lg bg-card/85 px-3 py-2 text-center text-[13px] font-medium backdrop-blur">
                {c.label}
              </div>
            </button>
          ))}
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
