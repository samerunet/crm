import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import BookingBanner from "@/components/sections/booking-banner";
import InstagramBanner from "@/components/sections/instagram-banner";

const FACTS = [
  "Bridal & Luxury",
  "San Diego + destination",
  "Natural → Full Glam",
  "All skin tones",
  "Studio & On-Location",
  "Brand / Editorial",
];

export const metadata: Metadata = {
  title: "About — Fariia | Bridal & Luxury Makeup Artist",
  description:
    "Bridal and luxury makeup artist in San Diego. Natural to full glam with a timeless, camera-ready finish.",
  openGraph: {
    title: "About — Fariia | Bridal & Luxury Makeup Artist",
    description:
      "Bridal and luxury makeup artist in San Diego. Natural to full glam with a timeless, camera-ready finish.",
    url: "/about",
    type: "article",
  },
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <main className="section-y">
      <div className="f-container space-y-10">
        <section>
          <BookingBanner
            align="left"
            glassOpacity={5}
            showCTA={false}
            subline="San Diego • Orange County • Los Angeles • Destination"
            className="w-full"
          />
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] xl:gap-10">
          <article className="glass specular rounded-3xl border border-border/70 p-6 sm:p-8 space-y-6">
            <header className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/90">
                Fari Makeup
              </p>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                About me
              </h1>
            </header>

            <div className="space-y-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              <p>
                Hi, I’m Fariia, a professional makeup artist based in San Diego,
                California. I specialize in bridal and luxury makeup.
              </p>
              <p>
                I love makeup that looks flawless in person and beautiful on
                camera - soft, elegant, and timeless. My style ranges from
                natural glam to full glam, but what I value most is perfect
                skin, balance, and attention to every detail. My approach is
                tailored to every client — I work confidently with all skin
                tones, eye shapes, mature skin, enhancing each woman’s natural
                beauty while keeping the overall look refined and timeless.
              </p>
              <p>
                I studied makeup artistry in Russia, Dubai, and Turkey, learning
                from top international artists and always staying updated with
                the latest trends and techniques. I use only high-end,
                professional products that I personally test and trust on my
                clients — because quality makes all the difference.
              </p>
              <p>
                What matters most to me is respect, trust, and care. I truly
                value every bride and client who sits in my chair — I put my
                heart into every detail, to make sure you feel confident and
                beautiful on your special day.
              </p>
              <p>
                I provide makeup both in my studio in San Diego, and
                on-location, traveling for weddings, destination events,
                editorials, and brand collaborations - even across Europe.
              </p>
              <p>
                For me, makeup isn’t just about beauty — it’s about connection,
                confidence, and creating memories that last.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {FACTS.map((fact) => (
                <span
                  key={fact}
                  className="inline-flex items-center rounded-full border border-border/70 bg-background/60 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/85 backdrop-blur"
                >
                  {fact}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/book"
                className="gbtn inline-flex h-11 items-center rounded-xl px-5 text-sm font-medium transition hover:opacity-95"
              >
                Book a Trial
              </Link>
              <Link
                href="/portfolio"
                className="inline-flex h-11 items-center rounded-xl border border-border/70 bg-card/70 px-5 text-sm font-medium text-foreground shadow-sm transition hover:bg-accent/15"
              >
                View Portfolio
              </Link>
            </div>
          </article>

          <aside className="glass-2 specular rounded-3xl border border-border/70 p-3 sm:p-5 flex flex-col gap-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border/60">
              <Image
                src="/images/fariia-portrait.jpg"
                alt="Fariia — Bridal & Luxury Makeup Artist"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Studio and on-location services with luxury, camera-ready makeup
              tailored to every bride and creative partner.
            </p>
          </aside>
        </div>

        <section>
          <InstagramBanner username="fari_makeup" />
        </section>
      </div>
    </main>
  );
}
