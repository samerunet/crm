import type { Metadata } from 'next';
import Script from 'next/script';
import FaqCta from '@/components/faq/FaqCta';
import FaqInteractive, { type FaqCategory } from '@/components/faq/FaqInteractive';

const SECTION_LABELS: Record<FaqCategory, string> = {
  booking: 'Booking & Availability',
  services: 'Services & Experience',
  travel: 'Travel & Destinations',
  timing: 'Timing & Capacity',
  payments: 'Payments & Billing',
  prep: 'Prep & Products',
  policies: 'Contracts & Policies',
  education: 'Education & Extras',
};

const faqs: Array<{ q: string; a: string; category: FaqCategory }> = [
  {
    category: 'booking',
    q: 'How do I inquire and book?',
    a: 'Use the “Book Now” button to share your event details—type of event, date, getting-ready location, party size, and any helpful notes. I’ll reply within 24 hours with availability and a personalized quote. If texting is easier, that option is available too. Once we confirm everything, your date is secured with a signed e-contract and a non-refundable retainer.',
  },
  {
    category: 'services',
    q: 'What is included in a bridal makeup application?',
    a: 'Every bridal application features a luxury skin prep, a custom long-wear makeup design, individual or strip lashes, and a wedding-day touch-up kit so you feel confident from first looks through the last dance.',
  },
  {
    category: 'travel',
    q: 'Do you travel on location? Are there travel fees?',
    a: 'Yes—on-location services are available for weddings and special events. Travel fees are calculated by distance (and any required tolls or parking). Studio appointments in San Diego are also available if you prefer to come to me.',
  },
  {
    category: 'timing',
    q: 'How long should I plan per person?',
    a: 'Bridal makeup typically takes 60–75 minutes. Bridal party members are usually 40–50 minutes each. We can run hair and makeup simultaneously to stay on schedule—the total time needed remains the same.',
  },
  {
    category: 'services',
    q: 'Do you stay for touch-ups?',
    a: 'Yes! A luxury touch-up or “stay-with-you” experience can be added if you’d like me on site for look changes or refreshes. Timing and rates are customized to your plans.',
  },
  {
    category: 'prep',
    q: 'What products do you use?',
    a: 'My kit is stocked exclusively with luxury and professional-grade products. Cleanliness is paramount—every client receives a freshly cleaned and sanitized brush set, and I continually refresh my kit with the best-performing formulas.',
  },
  {
    category: 'services',
    q: 'Do you work with all skin tones and ages?',
    a: 'Absolutely. I have extensive experience with every skin tone, texture, and age—from brides to mothers of the bride. Each look is tailored to celebrate your features and personal style.',
  },
  {
    category: 'payments',
    q: 'How do payments work?',
    a: 'A retainer is required to reserve your wedding date and is applied to your total. The remaining balance is due 10 days before the wedding via Zelle or Venmo. Studio appointments are paid at the time of service.',
  },
  {
    category: 'travel',
    q: 'Do you offer destination weddings or editorial/on-set work?',
    a: 'Absolutely! I love traveling for destination weddings, brand campaigns, and editorial shoots. Rates and travel expenses are tailored to the location and project scope.',
  },
  {
    category: 'payments',
    q: 'Do you require a retainer/deposit?',
    a: 'Yes, a non-refundable retainer is required to reserve your date and is applied toward your total balance.',
  },
  {
    category: 'booking',
    q: 'Do you offer trials or preview appointments?',
    a: 'Yes—trial sessions are optional but highly recommended to explore different looks or finalize your bridal vision. We typically schedule trials about a month before the wedding.',
  },
  {
    category: 'services',
    q: 'Do you offer hair styling too?',
    a: 'Yes! My professional hair stylist Hanna provides bridal and event hairstyling. We can coordinate hair and makeup simultaneously, on-location or in the studio. (Advance booking required.)',
  },
  {
    category: 'booking',
    q: 'Is there a minimum for on-location bookings?',
    a: 'Yes, there is an on-location minimum that varies by date and destination. Smaller parties can add services to reach the minimum, or you’re welcome to book in my San Diego studio.',
  },
  {
    category: 'timing',
    q: 'How many people can you accommodate?',
    a: 'I can comfortably accommodate up to seven clients per booking. Larger parties can be discussed with additional artists, if needed.',
  },
  {
    category: 'services',
    q: 'Are lashes and airbrush included?',
    a: 'Individual or strip lashes are included with every makeup service. I don’t work with airbrush makeup, but my complexion techniques deliver the same flawless, long-wearing finish.',
  },
  {
    category: 'prep',
    q: 'How should I prep my skin for the appointment?',
    a: 'Once your booking is confirmed you’ll receive a detailed prep guide. The most important step is arriving with clean, makeup-free skin—proper preparation helps your makeup last and look its best.',
  },
  {
    category: 'policies',
    q: 'What is your cancellation or reschedule policy?',
    a: 'All cancellation and reschedule terms are outlined in your signed contract. Please review it carefully—it covers timelines, retainers, and any change fees.',
  },
  {
    category: 'policies',
    q: 'Do you provide contracts and invoices?',
    a: 'Yes. Bridal and large-event bookings include a digital contract and itemized invoices. Studio appointments are the only exception.',
  },
  {
    category: 'education',
    q: 'Do you teach lessons or offer guides?',
    a: 'Yes! I teach professional makeup courses for artists and private lessons for anyone wanting to master their own makeup. Availability is limited, so inquire early for dates and details.',
  },
];

export const metadata: Metadata = {
  title: 'FAQ — Fari Makeup',
  description:
    'Answers to booking, travel, timing, payments, products, and policies so you know exactly what to expect with Fari Makeup.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'FAQ — Fari Makeup',
    description:
      'Detailed answers about bookings, services, travel, timing, prep, payments, and policies.',
    url: 'https://farimakeup.com/faq',
  },
  twitter: {
    title: 'FAQ — Fari Makeup',
    description:
      'Your top questions about bridal makeup, travel, timing, payments, and lessons—answered in one place.',
  },
};

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

const sectionOrder: FaqCategory[] = [
  'booking',
  'services',
  'travel',
  'timing',
  'payments',
  'prep',
  'policies',
  'education',
];

export default function FAQPage() {

  return (
    <main className="f-container section-y">
      <FaqJsonLd />
      <section className="glass-strong rounded-2xl p-6 sm:p-10">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="text-muted-foreground mt-3 max-w-prose text-base sm:text-lg">
          From first inquiry to final touch-up, this guide explains exactly how I work—booking,
          payments, timelines, travel, and more. If you still have questions, I’m one message away.
        </p>
        <p className="mt-4 text-sm sm:text-base">
          <FaqCta />
        </p>
      </section>

      <FaqInteractive faqs={faqs} sectionOrder={sectionOrder} sectionLabels={SECTION_LABELS} />
    </main>
  );
}
