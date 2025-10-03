// components/sections/about.tsx
"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

export default function AboutFari() {
  const reduce = useReducedMotion();
  const fade = {
    initial: { opacity: 0, y: reduce ? 0 : 10 },
    whileInView: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    viewport: { amount: 0.3, once: true },
  };

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10 md:py-14">
      <div className="grid items-center gap-6 md:grid-cols-2">
        {/* LEFT: copy */}
        <div>
          <motion.p
            {...fade}
            className="text-[11px] sm:text-xs tracking-[0.18em] uppercase text-[var(--muted)]"
          >
            ▫️𝗠𝗔𝗞𝗘𝗨𝗣▫️ San Diego Makeup Artist
          </motion.p>

          <motion.h2
            {...fade}
            className="mt-2 text-[28px] sm:text-[32px] md:text-[36px] leading-tight font-semibold text-[var(--fg)]"
          >
            Fari Makeup — Bridal Makeup Artist
          </motion.h2>

          <motion.p
            {...fade}
            className="mt-3 text-[15px] sm:text-[16px] leading-relaxed text-[color:var(--fg)]/88"
          >
            San Diego–based <strong>bridal makeup artist</strong> specializing in
            <strong> luxury, modern, soft glam</strong> that photographs beautifully. On-location
            across <strong>San Diego, Orange County, and Los Angeles</strong> (travel available).
            Seamless two-artist experience for weddings, engagements, and events. Studio
            appointments offered in San Diego. Now <strong>booking 2025/2026</strong>.
          </motion.p>

          <motion.ul
            {...fade}
            className="mt-4 space-y-2 text-[14px] text-[color:var(--fg)]/80"
          >
            <li className="flex gap-2">
              <span className="mt-[7px] size-[6px] rounded-full bg-[var(--accent)]" />
              Skin-focused, enhancing—not masking.
            </li>
            <li className="flex gap-2">
              <span className="mt-[7px] size-[6px] rounded-full bg-[var(--accent)]" />
              Soft natural glam to full glam; hair partners available.
            </li>
            <li className="flex gap-2">
              <span className="mt-[7px] size-[6px] rounded-full bg-[var(--accent)]" />
              Studio or on-location; travel ✈️ by request.
            </li>
          </motion.ul>

          <motion.div
            {...fade}
            className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <a
              href="/contact"
              className="inline-flex justify-center rounded-full px-5 py-3 text-sm font-medium transition active:scale-[0.99]
                         bg-[var(--accent)] text-white"
            >
              Check availability
            </a>

            <a
              href="mailto:farimakeup.sd@gmail.com"
              className="inline-flex justify-center rounded-full border theme-border bg-[var(--pill)] px-5 py-3 text-sm font-medium
                         text-[var(--fg)]/90 hover:bg-[var(--accent-2)] transition"
            >
              ✉️ farimakeup.sd@gmail.com
            </a>
          </motion.div>
        </div>

        {/* RIGHT: image / visual */}
        <motion.div
          {...fade}
          className="relative overflow-hidden rounded-2xl border theme-border bg-[var(--card)]"
        >
          {/* Replace with a real photo later */}
          <div className="aspect-[4/5]">
            <Image
              src="/placeholder/1.jpg"
              alt="Fari Makeup bridal look"
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover"
              priority
            />
          </div>
          {/* Soft top glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-24"
            style={{ background: "linear-gradient(180deg,#ffffff80,transparent)" }}
          />
        </motion.div>
      </div>
    </section>
  );
}
