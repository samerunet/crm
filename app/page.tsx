// app/page.tsx
import AboutFari from "@/components/sections/about";
import BookingBanner from "@/components/sections/booking-banner";
import HeroLanding from "@/components/sections/hero"; // now gallery-only
import Link from "next/link";

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Fari Makeup",
    description:
      "Luxury bridal makeup artist in San Diego offering soft glam and modern editorial looks. Serving San Diego, Orange County, and Los Angeles. Booking 2025/2026.",
    url: "https://www.example.com", // TODO: replace with your domain
    areaServed: ["San Diego", "Orange County", "Los Angeles", "Destination"],
    sameAs: ["https://www.instagram.com/fari_makeup/"],
    serviceType: "Bridal Makeup, Glam, Editorial, Lessons",
  };

  return (
    <main>
      {/* ABOUT FIRST */}
      <section className="mt-4">
        <AboutFari />
      </section>

      {/* CTA BANNER */}
      <div className="mt-6">
        <BookingBanner />
      </div>

      {/* HERO BELOW ABOUT — now the gallery */}
      <section className="mt-8">
        <HeroLanding />
      </section>

      {/* INSTAGRAM STRIP (kept aligned with same shell) */}
      <section className="relative f-container pb-14">
        <div className="specular glass-2 overflow-hidden rounded-[22px] md:rounded-[28px] -mx-3 sm:-mx-6">
          <div className="p-4 sm:p-6">
            <div className="specular glass rounded-[14px] p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm sm:text-base">See recent work on Instagram</p>
              <Link
                href="https://www.instagram.com/fari_makeup/"
                target="_blank"
                className="rounded-xl border border-border bg-secondary px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-accent/15"
              >
                @fari_makeup
              </Link>
            </div>
          </div>
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
