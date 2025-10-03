// components/sections/booking-banner.tsx
"use client";
import Link from "next/link";

export default function BookingBanner() {
  return (
    <div className="mx-auto w-full max-w-6xl lg:max-w-[86rem] px-4 sm:px-6">
      <div className="glass specular mt-4 rounded-2xl p-4 sm:p-5 shadow">
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
              className="rounded-xl border border-border bg-card/70 px-4 py-2 text-sm font-medium backdrop-blur hover:bg-accent/15 transition"
            >
              View Portfolio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
