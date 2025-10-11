// FILE: app/page.tsx  (REPLACE ENTIRE FILE)
import AboutFari from "@/components/sections/about";
import Link from "next/link";
import { InstagramIcon } from "@/components/ui/icons";

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

      {/* INSTAGRAM STRIP — minimal, matches navbar style */}
      <section className="relative f-container pb-14">
        {/* Transparent outer; only inner row has the liquid-glass feel */}
        <div className="rounded-2xl">
          <div className="glass-2 specular rounded-2xl border border-border/60 p-4 sm:p-5 shadow-[0_16px_50px_rgba(0,0,0,0.14)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/70">
                  <InstagramIcon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-medium tracking-wide">
                    Follow on Instagram
                  </h3>
                  <p className="text-xs text-muted-foreground">@fari_makeup</p>
                </div>
              </div>

              <Link
                href="https://www.instagram.com/fari_makeup/"
                target="_blank"
                rel="noopener"
                className="inline-flex h-10 items-center rounded-md px-4 text-sm font-medium border border-border/70 bg-card/70 hover:bg-accent/20 transition"
                aria-label="Open Instagram profile @fari_makeup"
              >
                Open Instagram
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
