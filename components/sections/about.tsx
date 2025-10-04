// components/sections/about.tsx
"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useBooking } from "@/components/ui/booking-provider";

export default function AboutFari() {
  const booking = useBooking();
  const reduce = useReducedMotion();

  const fade = {
    initial: { opacity: 0, y: reduce ? 0 : 10 },
    whileInView: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    viewport: { amount: 0.3, once: true },
  };

  return (
    <section className="relative f-container py-8 md:py-12">
      {/* backdrop glow to match other sections */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-x-0 -top-20 h-[120px] opacity-60 blur-2xl md:h-[160px]"
          style={{ background: "radial-gradient(60% 60% at 50% 0%, rgba(176,137,104,.30), transparent 70%)" }}
        />
      </div>

      {/* outer shell — same as hero/banner */}
      <div className="specular glass-2 overflow-hidden rounded-[22px] md:rounded-[28px] -mx-3 sm:-mx-6">
        <div className="grid gap-0 md:grid-cols-2 lg:[grid-template-columns:1.2fr_1fr]">
          {/* LEFT: copy in inner glass */}
          <div className="order-2 p-4 sm:p-6 md:order-1 md:p-10">
            <div className="specular glass rounded-[16px] p-5 sm:p-6 md:rounded-[20px]">
              <motion.p
                {...fade}
                className="text-[11px] sm:text-xs tracking-[0.18em] uppercase text-muted-foreground"
              >
                ▫️𝗠𝗔𝗞𝗘𝗨𝗣▫️ San Diego Makeup Artist
              </motion.p>

              <motion.h2
                {...fade}
                className="mt-2 font-serif text-[30px] sm:text-[42px] md:text-[58px] lg:text-[66px] leading-[1.05] font-semibold text-foreground"
                style={{ fontFamily: `"Playfair Display", ui-serif, Georgia, serif` }}
              >
                Fari Makeup — Bridal Makeup Artist
              </motion.h2>

              <motion.p
                {...fade}
                className="mt-3 text-[15px] sm:text-base leading-relaxed text-foreground/90"
              >
                San Diego–based <strong>bridal makeup artist</strong> specializing in
                <strong> luxury, modern, soft glam</strong> that photographs beautifully. On-location
                across <strong>San Diego, Orange County, and Los Angeles</strong> (travel available).
                Seamless two-artist experience for weddings, engagements, and events. Studio
                appointments offered in San Diego. Now <strong>booking 2025/2026</strong>.
              </motion.p>

              <motion.ul {...fade} className="mt-4 space-y-2 text-[14px] text-foreground/80">
                <li className="flex gap-2">
                  <span className="mt-[7px] size-[6px] rounded-full bg-accent" />
                  Skin-focused, enhancing—not masking.
                </li>
                <li className="flex gap-2">
                  <span className="mt-[7px] size-[6px] rounded-full bg-accent" />
                  Soft natural glam to full glam; hair partners available.
                </li>
                <li className="flex gap-2">
                  <span className="mt-[7px] size-[6px] rounded-full bg-accent" />
                  Studio or on-location; travel ✈️ by request.
                </li>
              </motion.ul>

              <motion.div {...fade} className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
                {/* OPEN BOOKING MODAL */}
                <button
                  type="button"
                  onClick={() => booking.open({ id: "general", title: "General Inquiry" })}
                  className="inline-flex justify-center rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow transition hover:bg-accent"
                >
                  Book Now
                </button>

                {/* Secondary contact stays as a mailto link */}
                <a
                  href="mailto:farimakeup.sd@gmail.com"
                  className="inline-flex justify-center rounded-full border border-border bg-card/80 px-5 py-3 text-sm font-medium text-foreground/90 backdrop-blur transition hover:bg-accent/15"
                >
                  ✉️ farimakeup.sd@gmail.com
                </a>
              </motion.div>
            </div>
          </div>

          {/* RIGHT: image column — matches hero heights */}
          <motion.div {...fade} className="relative order-1 overflow-hidden md:order-2">
            <div className="relative h-[280px] sm:h-[380px] md:h-[600px] lg:h-[740px]">
              <Image
                src="/placeholder/hero.png"   // swap to your about image
                alt="Fari Makeup — artist portrait"
                fill
                priority
                quality={85}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 55vw, 50vw"
                className="object-cover object-[50%_30%]"
              />
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(90deg, color-mix(in oklab, var(--background) 88%, transparent) 0%, rgba(0,0,0,0) 32%), radial-gradient(70% 80% at 0% 100%, color-mix(in oklab, var(--card) 70%, transparent) 0%, transparent 60%)",
                  mixBlendMode: "multiply",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,.22), inset 0 -1px 0 rgba(0,0,0,.08)",
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
