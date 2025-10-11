// FILE: components/sections/booking-banner.tsx  (DROP-IN REPLACEMENT)
"use client";

import clsx from "clsx";
import { useBooking } from "@/components/ui/booking-provider";

type Props = {
  /** Left/center/right text alignment (affects CTA alignment too) */
  align?: "left" | "center" | "right";
  /** 0–100: more = more opaque. 6 ≈ 94% transparent */
  glassOpacity?: number;
  /** Show CTA button (uses BookingProvider only when true) */
  showCTA?: boolean;
  /** Locations line */
  subline?: string;
  /** Headline text (gold) */
  headline?: string;
  /** Force everything onto one line (will scale down to fit) */
  oneLine?: boolean;
  className?: string;
};

/** CTA is isolated so the hook only runs when we actually render it */
function BannerCTA({ align }: { align: "left" | "center" | "right" }) {
  const booking = useBooking();
  return (
    <div
      className={clsx(
        "shrink-0",
        align === "center" ? "mx-auto" : align === "right" ? "ml-auto" : ""
      )}
    >
      <button
        onClick={() => booking.open()}
        type="button"
        className="inline-flex h-10 items-center rounded-full px-4 gbtn transition-transform hover:scale-[1.02] active:scale-[0.99] specular"
      >
        Book now
      </button>
    </div>
  );
}

export default function BookingBanner({
  align = "left",
  glassOpacity = 6,
  showCTA = false,
  headline = "LUXURY MAKEUP ARTIST",
  subline = "San Diego • Orange County • Los Angeles • Destination",
  oneLine = true,
  className = "",
}: Props) {
  const justify =
    align === "center"
      ? "justify-center text-center"
      : align === "right"
      ? "justify-end text-right"
      : "justify-start text-left";

  return (
    <section
      role="region"
      aria-label="Brand headline"
      className={clsx(
        // Stronger glass bar style (more liquid + crisp edge)
        "pointer-events-auto rounded-2xl border shadow-[0_24px_70px_rgba(0,0,0,0.26)] specular",
        "border-border/70 backdrop-blur-[18px]",
        className
      )}
      style={{
        background: `color-mix(in oklab, var(--card) ${glassOpacity}%, transparent)`,
      }}
    >
      <div
        className={clsx(
          "px-4 sm:px-5 py-3 sm:py-3.5",
          "flex items-center gap-3 sm:gap-4",
          justify,
          oneLine ? "whitespace-nowrap overflow-hidden" : ""
        )}
      >
        {/* Headline + subline in one line */}
        <div className={clsx("min-w-0 flex items-baseline gap-2 sm:gap-3", oneLine && "overflow-hidden")}>
          <span
            className="heading-gold block shrink-0"
            style={{
              fontFamily:
                `'Arizona Display','Arizona','Playfair Display','Cormorant Garamond',Georgia,serif`,
              fontSize: "clamp(18px, 3.2vw, 28px)",
              letterSpacing: ".6px",
              lineHeight: 1.04,
            }}
          >
            {headline}
          </span>

          <span
            className="hidden sm:inline select-none text-foreground/55"
            aria-hidden
          >
            ·
          </span>

          <span
            className={clsx(
              "text-foreground/85",
              oneLine && "truncate"
            )}
            style={{
              fontFamily: `'Cormorant Garamond','Times New Roman',ui-serif,Georgia,serif`,
              fontSize: "clamp(13px, 2.2vw, 16px)",
              lineHeight: 1.15,
            }}
            title={subline}
          >
            {subline}
          </span>
        </div>

        {/* Optional CTA (safe — hook only loads here) */}
        {showCTA && <BannerCTA align={align} />}
      </div>

      {/* Gold liquid-glass headline styling (kept global for consistency) */}
      <style jsx global>{`
        /* If you host Arizona, drop files in /public/fonts and enable:
        @font-face {
          font-family: "Arizona Display";
          src:
            url("/fonts/Arizona-Display.woff2") format("woff2"),
            url("/fonts/Arizona-Display.woff") format("woff");
          font-weight: 600 800;
          font-style: normal;
          font-display: swap;
        } */

        .heading-gold {
          background: linear-gradient(
            180deg,
            #f6eddc 0%,
            #e7d3b0 32%,
            var(--gold) 58%,
            #8b6547 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
          -webkit-text-stroke: 0.6px rgba(108, 58, 34, 0.5);
          text-shadow:
            0 1px 0 rgba(255,255,255,.2),
            0 12px 40px rgba(0,0,0,.22);
        }
        @supports not (-webkit-text-stroke: 1px black) {
          .heading-gold { color: var(--gold); }
        }
      `}</style>
    </section>
  );
}
