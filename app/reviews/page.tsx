import type { Metadata } from 'next';

import ReviewsCarousel, { ReviewDisplay } from './reviews-carousel';

export const metadata: Metadata = {
  title: 'Client Reviews · Luxury Bridal Makeup Testimonials',
  description:
    'Verified bridal and special event makeup reviews from San Diego to destination weddings. Hear how Fari Makeup delivers calm, camera-ready glam.',
  alternates: { canonical: '/reviews' },
};

// const REVIEWS: ReviewDisplay[] = [
//   {
//     id: 'review-1',
//     name: 'Sophia M.',
//     service: 'Bridal Makeup · La Jolla Cove',
//     rating: 5,
//     highlight:
//       'Fari kept the entire morning serene. My bridal glam felt lightweight yet lasted through tears, ocean breeze, and dancing. Every photo still looks flawless.',
//   },
//   {
//     id: 'review-2',
//     name: 'Ashley T.',
//     service: 'Destination Wedding · Cabo San Lucas',
//     rating: 5,
//     highlight:
//       'She handled travel, on-site set up, and our large bridal party with ease. Everyone looked cohesive and fresh in the heat. Best glam experience ever.',
//   },
//   {
//     id: 'review-3',
//     name: 'Lauren P.',
//     service: 'Editorial Campaign · Downtown Los Angeles',
//     rating: 5,
//     highlight:
//       'From mood board through final frame, Fari delivered immaculate, camera-ready makeup and stayed on set for touch-ups. The creative team loved working with her.',
//   },
// ];

export default function ReviewsPage() {
  return (
    <main className="relative f-container py-8 md:py-12">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-x-0 -top-24 h-[160px] opacity-70 blur-3xl md:h-[220px]"
          style={{
            background:
              'radial-gradient(60% 60% at 50% 0%, rgba(176,137,104,.32), transparent 70%)',
          }}
        />
      </div>

      <section className="specular glass-2 overflow-hidden rounded-[26px] border border-border/60 px-4 py-8 shadow-[0_26px_70px_rgba(0,0,0,0.30)] sm:px-6 md:px-10 md:py-12">
        <header className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.32em] text-white/70">Client Love</p>
          <h1
            className="font-serif text-[32px] font-semibold tracking-[-0.01em] text-white md:text-[40px]"
            style={{ fontFamily: '"Playfair Display", ui-serif, Georgia, serif' }}
          >
            Bridal Reviews & Testimonials
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-white/75 md:text-base">
            Kind words from real brides, destination celebrations, and creative partners across San
            Diego, Orange County, Los Angeles, and beyond. Ready for calm, camera-ready glam?
          </p>
        </header>

        <div className="mt-8 md:mt-10">
          {/* <ReviewsCarousel reviews={REVIEWS} /> */}
          <p className="mx-auto max-w-2xl text-sm text-white/75 md:text-base ">
           COMING SOON ...
          </p>
        </div>
      </section>

      <section className="mt-10 rounded-[26px] border border-white/15 bg-white/6 px-6 py-8 text-center text-white/80 shadow-[0_18px_55px_rgba(0,0,0,0.28)] backdrop-blur sm:px-8 md:px-12">
        <p className="text-sm leading-relaxed md:text-base">
          Planning your bridal glam or special event?{' '}
          <a href="/services" className="text-white underline underline-offset-4">
            Explore services
          </a>{' '}
          or{' '}
          <a href="mailto:farimakeup.sd@gmail.com" className="text-white underline underline-offset-4">
            email farimakeup.sd@gmail.com
          </a>{' '}
          to secure your date.
        </p>
      </section>
    </main>
  );
}
