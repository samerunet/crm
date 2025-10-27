// FILE: components/ui/footer.tsx
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="f-container pt-10 pb-0 text-sm">
      {/* FULL-BLEED WRAPPER (transparent - lets your page bg/colors show) */}
      <div className="relative right-1/2 left-1/2 -mx-[50vw] w-screen">
        {/* INNER: max-width container so content doesn't span edge-to-edge */}
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 md:px-8">
          {/* === GLASS PANEL (restores your original colors) === */}
          <div className="relative overflow-hidden rounded-[28px] border border-white/20 bg-white/8 px-6 py-7 text-white/80 shadow-[0_24px_65px_rgba(0,0,0,0.28)] backdrop-blur sm:px-8 sm:py-8 md:px-12 md:py-10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(120% 60% at 50% 0%, rgba(255,255,255,0.20), rgba(255,255,255,0.06) 65%, transparent)',
              }}
            />
            <div className="relative space-y-4">
              {/* use light-on-dark text again */}
              <p className="text-base leading-snug text-black/90 sm:text-[17px] sm:leading-snug">
                Bridal makeup artist in San Diego offering luxury, soft & full glam looks for
                weddings and events.
              </p>

              <div className="space-y-1">
                <h2 className="text-[10px] font-semibold tracking-[0.22em] text-black/70 uppercase">
                  Service Areas
                </h2>
                <p className="text-[13px] leading-snug text-black/85">
                  San Diego • La Jolla • Del Mar • Carlsbad • Orange County • Los Angeles •
                  Destination Weddings
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <a
                  href="mailto:farimakeup.sd@gmail.com"
                  className="text-black/90 underline-offset-4 transition-colors hover:text-white hover:underline"
                  aria-label="Email Fari Makeup"
                >
                  farimakeup.sd@gmail.com
                </a>
                <div className="text-xs text-black/60">
                  Luxury Bridal & Soft Glam • On-location & Studio
                </div>
              </div>
            </div>
          </div>
          {/* === /GLASS PANEL === */}
        </div>

        {/* FULL-BLEED COPYRIGHT STRIP (accessible contrast) */}
        <div className="mt-6 px-4 sm:px-6 md:px-8">
          <div className="relative mx-auto max-w-screen-2xl overflow-hidden rounded-2xl border border-black/50 bg-black/85 px-4 py-4 text-center text-xs text-white/88 shadow-[0_18px_42px_rgba(0,0,0,0.28)] backdrop-blur-sm">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(140deg, rgba(203,185,164,0.12), rgba(17,17,17,0.7) 60%, rgba(0,0,0,0.85))',
              }}
            />
            <span className="relative block tracking-[0.16em] uppercase text-[11px] text-white/90">
              © {year} Fari Makeup. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
