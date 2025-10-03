// app/services/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services — Fari Makeup",
  description:
    "Luxury bridal makeup services in San Diego, OC, and LA. Bridal trials, wedding-day makeup, bridal party, and on-location touch-ups.",
};

type CardProps = {
  title: string;
  desc: string;
  meta: string;
  href: string;
  cta: string;
};

function ServiceCard({ title, desc, meta, href, cta }: CardProps) {
  return (
    <article
      className={[
        "group relative overflow-hidden rounded-2xl p-5 shadow",
        // base glass look
        "glass specular",
        // smooth transforms & color changes
        "transition-all duration-300 ease-out",
        // lift + deepen shadow on hover
        "hover:-translate-y-1 hover:shadow-[0_16px_60px_rgba(0,0,0,0.18)]",
        // slightly stronger glass on hover
        "hover:bg-card/70 hover:border-border/80",
        // GPU for smoother anim
        "transform-gpu will-change-transform",
      ].join(" ")}
    >
      {/* moving sheen bar */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-1 -left-[30%] h-[140%] w-[30%] rotate-12 bg-white/10 blur-md transition-transform duration-700 ease-out group-hover:translate-x-[260%]"
      />
      {/* soft inner highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[20px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,.28), inset 0 -1px 0 rgba(0,0,0,.06)",
        }}
      />

      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm font-medium opacity-80">{meta}</span>
        <Link
          href={href}
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent"
        >
          {cta}
        </Link>
      </div>
    </article>
  );
}

export default function ServicesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl lg:max-w-[86rem] px-4 sm:px-6 py-10">
      {/* Heading */}
      <header className="mb-6 sm:mb-10">
        <h1
          className="font-serif text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight"
          style={{ fontFamily: `"Playfair Display", ui-serif, Georgia, serif` }}
        >
          Services
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">
          Bridal-focused, camera-ready looks that last from first look to last dance.
        </p>
      </header>

      {/* Service cards */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ServiceCard
          title="Bridal Trial"
          desc="Consultation + custom look, skin prep, lashes. We refine until it’s perfect."
          meta="60–90 min"
          href="/contact"
          cta="Book Trial"
        />
        <ServiceCard
          title="Wedding Day — Bride"
          desc="Photo-ready glam, tailored to your trial. Includes lashes & mini touch-up kit."
          meta="On-site"
          href="/contact"
          cta="Check Availability"
        />
        <ServiceCard
          title="Bridal Party & Mothers"
          desc="Soft glam that complements the bride’s look. Lashes included."
          meta="Per person"
          href="/contact"
          cta="Inquire"
        />
        <ServiceCard
          title="Touch-Ups / Stay-Through"
          desc="On-site maintenance for portraits, ceremony, and reception transitions."
          meta="Hourly / Package"
          href="/contact"
          cta="Add On"
        />
        <ServiceCard
          title="Special Events"
          desc="Engagement, shower, photoshoot, gala—elevated looks tailored to the moment."
          meta="Studio / On-site"
          href="/contact"
          cta="Book Now"
        />
        <ServiceCard
          title="Lessons & Education"
          desc="Private lessons and pro education. Technique, kit review, and photo-tested looks."
          meta="1:1 / Small Group"
          href="/contact"
          cta="Request Info"
        />
      </section>

      {/* Notice / Service area */}
      <div className="mt-8 glass specular rounded-2xl p-4 sm:p-5 text-sm text-muted-foreground">
        Serving <strong>San Diego</strong>, <strong>Orange County</strong>, and{" "}
        <strong>Los Angeles</strong>. Destination & travel available upon request.
        Minimums may apply for on-site bookings.
      </div>

      {/* CTA row */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Booking <strong>2025 / 2026</strong> — limited peak-season dates.
        </p>
        <div className="flex gap-2">
          <Link
            href="/contact"
            className="rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-accent transition"
          >
            Check Availability
          </Link>
          <Link
            href="/portfolio"
            className="rounded-xl border border-border bg-card/70 px-5 py-2 text-sm font-medium backdrop-blur hover:bg-accent/15 transition"
          >
            View Portfolio
          </Link>
        </div>
      </div>
    </main>
  );
}
