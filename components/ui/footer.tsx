// components/ui/footer.tsx
export default function Footer() {
  return (
    <footer className="f-container pt-16 pb-20 text-sm text-white/80">
      <div className="relative overflow-hidden rounded-[28px] border border-white/20 bg-white/8 px-6 py-10 shadow-[0_24px_65px_rgba(0,0,0,0.28)] backdrop-blur sm:px-8 sm:py-11 md:px-12 md:py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 60% at 50% 0%, rgba(255,255,255,0.2), rgba(255,255,255,0.04) 65%, transparent)',
          }}
        />
        <div className="relative space-y-8 md:space-y-9">
          <p className="text-lg leading-relaxed text-black/92 md:text-xl md:leading-9">
            Bridal makeup artist in San Diego offering luxury, soft-glam looks for weddings and
            events.
          </p>

          <div className="space-y-2">
            <h2 className="text-xs font-semibold tracking-[0.28em] text-black/70 uppercase">
              Service Areas
            </h2>
            <p className="text-black/85">
              San Diego • La Jolla • Del Mar • Carlsbad • Orange County • Los Angeles • Destination
              Weddings
            </p>
          </div>

          <div className="flex flex-col gap-3 text-black/90 sm:flex-row sm:items-center sm:gap-8">
            <a
              href="mailto:farimakeup.sd@gmail.com"
              className="transition-colors hover:text-black"
              aria-label="Email Fari Makeup"
            >
              farimakeup.sd@gmail.com
            </a>
            <a
              href="tel:16193996160"
              className="transition-colors hover:text-black"
              aria-label="Call Fari Makeup at 619-399-6160"
            >
              619-399-6160
            </a>
          </div>
        </div>
      </div>

      <div className="mt-10 text-center text-xs text-black/75">
        © {new Date().getFullYear()} Fari Makeup. All rights reserved.
      </div>
    </footer>
  );
}
