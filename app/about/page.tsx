// FILE: app/about/page.tsx  (REPLACE ENTIRE FILE)
import Image from "next/image";
import type { Metadata } from "next";
import BookingBanner from "@/components/sections/booking-banner";
import InstagramBanner from "@/components/sections/instagram-banner";

export const metadata: Metadata = {
  title: "About — Fari Makeup",
  description:
    "Mission Valley–based makeup artist specializing in bridal, editorial, and events. Learn Fari’s story, process, and philosophy.",
  openGraph: {
    title: "About — Fari Makeup",
    description:
      "Mission Valley–based makeup artist specializing in bridal, editorial, and events. Learn Fari’s story, process, and philosophy.",
    url: "/about",
    type: "article",
  },
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="f-container section-y">
      {/* 1) TOP TEXT BAR (under navbar) */}
      <section className="mb-6 sm:mb-8">
        <div className="flex">
          <BookingBanner
            align="left"
            glassOpacity={5}               // ~95% transparent
            showCTA={false}                // keep About minimal
            subline="San Diego • Orange County • Los Angeles • Destination"
            className="w-full md:w-[760px]"
          />
        </div>
      </section>

      {/* 2) HERO BOX (image card) */}
      <section className="glass-2 rounded-2xl p-0 overflow-hidden">
        <div className="relative h-[58vh] min-h-[460px] md:h-[620px]">
          <Image
            src="/placeholder/hero.png"    // swap to your hero photo if needed
            alt="Fari makeup artistry portrait"
            fill
            priority
            className="object-cover"
            sizes="(min-width:1024px) 90vw, 100vw"
            style={{ objectPosition: "50% 35%" }}
          />
          {/* soft tint to keep things readable if you add overlays later */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,.06), rgba(0,0,0,0) 30%, rgba(0,0,0,.12) 100%)",
              mixBlendMode: "multiply",
            }}
          />
        </div>
      </section>

      {/* 3) INSTAGRAM BANNER */}
      {/* <section className="mt-6 sm:mt-8">
        <InstagramBanner username="yourhandle" />
      </section> */}
    </main>
  );
}
