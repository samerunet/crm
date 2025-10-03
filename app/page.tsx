// app/page.tsx
import HeroLanding from "@/components/sections/hero"; // your existing hero
import Link from "next/link";

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Fari Makeup",
    description:
      "Luxury bridal makeup artist in San Diego offering soft glam and modern editorial looks. Serving San Diego, Orange County, and Los Angeles. Booking 2025/2026.",
    url: "https://www.example.com", // TODO: replace with your domain when live
    areaServed: ["San Diego", "Orange County", "Los Angeles", "Destination"],
    sameAs: ["https://www.instagram.com/fari_makeup/"],
    serviceType: "Bridal Makeup, Glam, Editorial, Lessons",
  };

  return (
    <main>
      <HeroLanding />

      {/* --- CTA STRIP --- */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <div className="rounded-xl border border-border bg-card/60 backdrop-blur p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm sm:text-base">
            Booking <strong>2025 / 2026</strong> · San Diego • OC • LA · Destination on request
          </p>
          <div className="flex gap-2">
            <Link
              href="/contact"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-accent transition"
            >
              Check Availability
            </Link>
            <Link
              href="/portfolio"
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-accent/15 transition"
            >
              View Portfolio
            </Link>
          </div>
        </div>
      </section>

      {/* --- ABOUT / SEO SECTION --- */}
      <section id="about" className="mx-auto max-w-6xl px-4 sm:px-6 py-10 md:py-14">
        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur p-6 sm:p-8">
          <h2
            className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight"
            style={{ fontFamily: `"Playfair Display", ui-serif, Georgia, serif` }}
          >
            About Fari Makeup
          </h2>

          <p className="mt-3 text-[15px] sm:text-base text-muted-foreground">
            Fari Makeup is a <strong>luxury bridal makeup artist in San Diego</strong>, crafting
            <strong> soft glam</strong> and <strong>modern editorial</strong> looks that photograph beautifully in
            natural light and on camera. Brides choose Fari for skin-focused complexion, seamless blends, and
            long-wear makeup that stays flawless from first look to last dance.
          </p>

          <p className="mt-3 text-[15px] sm:text-base text-muted-foreground">
            Available for <strong>weddings</strong>, <strong>engagement shoots</strong>, and
            <strong> special events</strong> across <strong>San Diego</strong>, <strong>Orange County</strong>, and
            <strong> Los Angeles</strong>—with destination travel on request. Education includes private lessons and
            pro courses for artists who want elevated, camera-ready techniques.
          </p>

          <ul className="mt-5 grid gap-2 text-[15px] sm:text-base">
            <li>• Bridal • Glam • Editorial • Photoshoots</li>
            <li>• Trials, wedding-day services, & on-site touch-ups</li>
            <li>• Serving San Diego • OC • LA • Destination</li>
            <li>
              • Email:{" "}
              <a className="underline" href="mailto:farimakeup.sd@gmail.com">
                farimakeup.sd@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </section>

      {/* --- SOCIAL PROOF / SIMPLE LINK --- */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 pb-14">
        <div className="rounded-xl border border-border bg-card/50 backdrop-blur p-4 sm:p-5 flex items-center justify-between">
          <p className="text-sm sm:text-base">See recent work on Instagram</p>
          <a
            href="https://www.instagram.com/fari_makeup/"
            target="_blank"
            className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium hover:bg-accent/15 transition"
          >
            @fari_makeup
          </a>
        </div>
      </section>

      {/* JSON-LD for SEO */}
      <script
        type="application/ld+json"
        // @ts-ignore
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
