// FILE: components/sections/booking-banner.tsx  (DROP-IN REPLACEMENT)
'use client';

import clsx from 'clsx';
import { useBooking } from '@/components/ui/booking-provider';

type Props = {
  /** Left/center/right text alignment (affects CTA alignment too) */
  align?: 'left' | 'center' | 'right';
  /** 0–100: more = more opaque. 6 ≈ 94% transparent */
  glassOpacity?: number;
  /** Show CTA button (uses BookingProvider only when true) */
  showCTA?: boolean;
  /** Locations line */
  subline?: string;
  /** Headline text (gold) */
  headline?: string;
  /** Semantic element for the headline (helps SEO/AT) */
  headlineElement?: keyof JSX.IntrinsicElements;
  /** Alignment override for the subline badge */
  sublineAlign?: 'start' | 'center' | 'end';
  /** Optional class override for the subline span */
  sublineClassName?: string;
  /** Force everything onto one line (will scale down to fit) */
  oneLine?: boolean;
  className?: string;
};

/** CTA is isolated so the hook only runs when we actually render it */
function BannerCTA({ align }: { align: 'left' | 'center' | 'right' }) {
  const booking = useBooking();
  return (
    <div
      className={clsx(
        'shrink-0',
        align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : '',
      )}
    >
      <button
        onClick={() => booking.open()}
        type="button"
        className="gbtn specular inline-flex h-10 items-center rounded-full px-4 transition-transform hover:scale-[1.02] active:scale-[0.99]"
      >
        Book now
      </button>
    </div>
  );
}

export default function BookingBanner({
  align = 'left',
  glassOpacity = 6,
  showCTA = false,
  headline = 'LUXURY MAKEUP ARTIST',
  subline = 'San Diego • Orange County • Los Angeles • Destination',
  headlineElement = 'span',
  sublineAlign = 'start',
  sublineClassName,
  oneLine = true,
  className = '',
}: Props) {
  const justify =
    align === 'center'
      ? 'justify-center text-center'
      : align === 'right'
        ? 'justify-end text-right'
        : 'justify-start text-left';
  const HeadlineTag = headlineElement as keyof JSX.IntrinsicElements;
  const stackClass =
    align === 'right'
      ? 'flex w-full flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3'
      : align === 'center'
        ? 'flex w-full flex-col items-center gap-2 text-center sm:flex-row sm:items-center sm:justify-center sm:gap-3'
        : 'flex w-full flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3';
  const baseBadgeClass =
    'inline-flex items-center rounded-full border border-white/40 bg-white/[0.22] px-3 py-1 text-sm text-black shadow-[0_10px_28px_rgba(0,0,0,0.18)] backdrop-blur-md';
  const sublineAlignClass =
    sublineAlign === 'end'
      ? align === 'right'
        ? ''
        : 'ml-auto text-left sm:self-end sm:text-right'
      : sublineAlign === 'center'
        ? 'sm:mx-auto text-center'
        : align === 'right'
          ? 'text-right'
          : 'text-left sm:ml-auto';

  return (
    <section
      role="region"
      aria-label="Brand headline"
      className={clsx(
        // Stronger glass bar style (more liquid + crisp edge)
        'specular pointer-events-auto rounded-2xl border shadow-[0_24px_70px_rgba(0,0,0,0.26)]',
        'border-border/70 backdrop-blur-[18px]',
        className,
      )}
      style={{
        background: `color-mix(in oklab, var(--card) ${glassOpacity}%, transparent)`,
      }}
    >
      <div
        className={clsx(
          'px-4 py-3 sm:px-5 sm:py-3.5',
          'flex items-center gap-3 sm:gap-4',
          justify,
          oneLine && align !== 'right' ? 'overflow-hidden whitespace-nowrap' : '',
        )}
      >
        {/* Headline + subline in one line */}
        <div
          className={clsx(
            'flex min-w-0',
            stackClass,
            oneLine && align !== 'right' && sublineAlign !== 'end' && 'overflow-hidden',
          )}
        >
          <HeadlineTag
            className="heading-gold block shrink-0"
            style={{
              fontFamily: `'Arizona Display','Arizona','Playfair Display','Cormorant Garamond',Georgia,serif`,
              fontSize: 'clamp(18px, 3.2vw, 28px)',
              letterSpacing: '.6px',
              lineHeight: 1.04,
            }}
          >
            {headline}
          </HeadlineTag>

          <span
            className={clsx(
              baseBadgeClass,
              sublineClassName ?? 'text-foreground/90',
              sublineAlignClass,
              oneLine && align === 'left' && sublineAlign !== 'end' && 'truncate',
            )}
            style={{
              fontFamily: `'Cormorant Garamond','Times New Roman',ui-serif,Georgia,serif`,
              fontSize: 'clamp(13px, 2.2vw, 15px)',
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
            0 1px 0 rgba(255, 255, 255, 0.2),
            0 12px 40px rgba(0, 0, 0, 0.22);
        }
        @supports not (-webkit-text-stroke: 1px black) {
          .heading-gold {
            color: var(--gold);
          }
        }
      `}</style>
    </section>
  );
}
