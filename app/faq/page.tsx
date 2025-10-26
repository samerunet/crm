// FILE: app/faq/page.tsx  (REPLACE ENTIRE FILE)
import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'FAQ — Booking, Trials, Travel, Timing, Payments & Contracts',
  description:
    'Clear answers about retainers, travel fees, timelines, group sizes, destination weddings, payments & e-contracts for Fari Makeup.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'Makeup Recommendations for a Timeless Bridal Look',
    description:
      'Pro tips for camera-ready, soft-glam bridal makeup: skincare prep, long-wear products, timeline planning and touch-up kits.',
    url: 'https://farimakeup.com/faq',
  },
  twitter: {
    title: 'Makeup Recommendations for a Timeless Bridal Look',
    description:
      'Pro tips for camera-ready, soft-glam bridal makeup: skincare prep, long-wear products, timeline planning and touch-up kits.',
  },
};

const faqs = [
  {
    q: 'How do I inquire and book?',
    a: 'Use the link below to share your date, getting-ready location, party size, and any links to inspiration. You’ll receive availability and a tailored quote. Once details are confirmed, a signed e-contract and retainer secure your date.',
  },
  {
    q: 'Do you require a retainer/deposit?',
    a: 'Yes. A retainer is required to reserve your date and is applied to your total. The retainer is non-refundable once the contract is signed, because the schedule is blocked for your party.',
  },
  {
    q: 'When should I book my wedding makeup?',
    a: 'Most brides book 6–12 months in advance, especially for peak seasons and popular Saturdays. If your date is sooner, still inquire—openings do happen.',
  },
  {
    q: 'Do you offer trials/preview appointments?',
    a: 'Yes. Trials are recommended 6–10 weeks before the wedding or key photos. We discuss your vision, lighting, wardrobe, and skincare so you see a refined, camera-ready look.',
  },
  {
    q: 'What is included in a bridal makeup application?',
    a: 'Skin prep, complexion refinement, soft sculpting, eyes, brows, cheeks, lips, and individual or strip lashes if desired. Every look is tailored to your features and lighting.',
  },
  {
    q: 'Do you offer hair styling too?',
    a: 'Yes. Bridal hairstyle and touch-ups are available, and larger parties can be accommodated with an assistant. Hair services can be added to your proposal.',
  },
  {
    q: 'Do you travel on location? Are there travel fees?',
    a: 'Yes, on-site services are available throughout San Diego and beyond. Local travel is often included; extended mileage, early call times, parking, tolls, or destination travel will be itemized on your quote.',
  },
  {
    q: 'Is there a minimum for on-location bookings?',
    a: 'Minimums may apply for peak dates, early mornings, and locations outside the core service area. Your quote will specify any minimums before you sign.',
  },
  {
    q: 'How long should I plan per person?',
    a: 'Bridal makeup typically takes 60–75 minutes. Party members are 45–60 minutes each. Hair timing is similar. We build a calm, realistic timeline with your photographer.',
  },
  {
    q: 'How many people can you accommodate?',
    a: 'Large parties are welcome. We can add a licensed assistant to keep the morning smooth and on schedule. Let us know your final headcount early for staffing.',
  },
  {
    q: 'Do you stay for touch-ups?',
    a: 'Yes. On-site touch-up or second-look coverage can be added by the hour. Many brides love a quick refresh before portraits and reception entrances.',
  },
  {
    q: 'Lashes, men’s grooming, and airbrush?',
    a: 'Lashes are available at no extra charge if desired. Men’s grooming and airbrush can be added upon request.',
  },
  {
    q: 'What products do you use? Are they photo-friendly?',
    a: 'We use a pro kit curated for longevity and photography: skin-prep, waterproof or water-resistant formulas, and textures that read beautifully in person and on camera. Ingredient-sensitive clients can request alternatives.',
  },
  {
    q: 'How should I prep my skin for the appointment?',
    a: 'Hydrate well, avoid new treatments within a week of your event, and arrive with clean, moisturized skin. If you are unsure, we’ll recommend a simple prep plan at trial.',
  },
  {
    q: 'Do you work with all skin tones and ages?',
    a: 'Yes. The kit is stocked for every undertone and depth, and the application approach adapts to texture, sensitivity, and mature skin.',
  },
  {
    q: 'What is your cancellation or reschedule policy?',
    a: 'Because your date is reserved and other work is declined, retainers are non-refundable. Reschedules are handled case-by-case based on availability and contract terms.',
  },
  {
    q: 'How do payments work?',
    a: 'Retainer at signing; remaining balance is due by the deadline in your contract. We accept cash, Zelle, or Venmo. Invoices and receipts are provided.',
  },
  {
    q: 'Do you provide contracts and invoices?',
    a: 'Yes. You’ll receive a digital contract for e-signature and itemized invoices for the retainer, trial, and remaining balance. Your planner can be CC’d on paperwork if you prefer.',
  },
  {
    q: 'Do you offer destination weddings or editorial/on-set work?',
    a: 'Absolutely. We travel for weddings and creative productions. Travel logistics, per-diem, and accommodations (if applicable) will be included in your proposal.',
  },
  {
    q: 'Do you teach lessons or offer guides?',
    a: 'Yes—private lessons and online guides are available so you can recreate key steps at home. Ask about current offerings.',
  },
];

function FaqJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };

  return (
    <Script
      id="faq-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default function FAQPage() {
  return (
    <main className="f-container section-y">
      {/* Header */}
      <section className="glass-strong rounded-2xl p-6 sm:p-10">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="text-muted-foreground mt-3 max-w-prose text-base sm:text-lg">
          Planning should feel calm and clear. These answers cover the most common booking, trial,
          travel, timing, payment, and contract questions. If you don’t see what you need, reach
          out—happy to help.
        </p>

        {/* Subtle inline link instead of a big button */}
        <p className="mt-4 text-sm sm:text-base">
          <Link href="/#book" className="font-medium underline underline-offset-4 hover:no-underline">
            Check availability &rarr;
          </Link>
        </p>

        {/* Quiet chips (anchors) */}
        <div className="mt-5 flex flex-wrap gap-2">
          <a
            href="#booking"
            className="ios-chip inline-flex h-8 items-center rounded-xl px-3 text-sm"
          >
            Booking
          </a>
          <a
            href="#trials"
            className="ios-chip inline-flex h-8 items-center rounded-xl px-3 text-sm"
          >
            Trials
          </a>
          <a
            href="#travel"
            className="ios-chip inline-flex h-8 items-center rounded-xl px-3 text-sm"
          >
            Travel
          </a>
          <a
            href="#timing"
            className="ios-chip inline-flex h-8 items-center rounded-xl px-3 text-sm"
          >
            Timing
          </a>
          <a
            href="#payments"
            className="ios-chip inline-flex h-8 items-center rounded-xl px-3 text-sm"
          >
            Payments
          </a>
          <a
            href="#contracts"
            className="ios-chip inline-flex h-8 items-center rounded-xl px-3 text-sm"
          >
            Contracts
          </a>
        </div>
      </section>

      {/* FAQ grid */}
      <section className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2">
        {faqs.map((item, i) => {
          const id =
            i < 5
              ? 'booking'
              : i < 7
                ? 'trials'
                : i < 10
                  ? 'travel'
                  : i < 14
                    ? 'timing'
                    : i < 18
                      ? 'payments'
                      : 'contracts';

          return (
            <details key={i} id={id} className="group glass rounded-2xl p-4 sm:p-5">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                <h2 className="font-medium leading-6">{item.q}</h2>
                <span className="border-border/60 grid h-6 w-6 shrink-0 place-items-center rounded-md border text-sm">
                  +
                </span>
              </summary>
              <div className="mt-3 text-sm text-foreground/90 sm:text-base">{item.a}</div>
            </details>
          );
        })}
      </section>

      <FaqJsonLd />
    </main>
  );
}
