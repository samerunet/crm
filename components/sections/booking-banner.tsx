// components/sections/booking-banner.tsx
"use client";
import Link from "next/link";

export default function BookingBanner() {
  return (
    <section className="relative f-container">
      {/* OUTER SHELL — same as hero/about */}
      <div className="specular glass-2 overflow-hidden rounded-[22px] md:rounded-[28px] -mx-3 sm:-mx-6">
        {/* Inner card (same style you use inside hero/about) */}
        <div className="p-4 sm:p-6">
          <div className="specular glass rounded-[14px] p-4 sm:p-5">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-foreground/90">
                <span className="font-medium">Booking 2025 / 2026</span> · San Diego • OC • LA · Destination on request
              </p>
              <div className="flex gap-2">
                <Link
                  href="/contact"
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-accent transition"
                >
                  Check Availability
                </Link>
                <Link
                  href="/portfolio"
                  className="rounded-xl border border-border bg-card/70 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-accent/15"
                >
                  View Portfolio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
