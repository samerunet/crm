import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

import { GUIDE_PRODUCT } from '@/lib/guide-product';

export const metadata: Metadata = {
  title: `${GUIDE_PRODUCT.title} — Digital Guide`,
  description: GUIDE_PRODUCT.description,
  alternates: { canonical: '/guides' },
};

export default function Page() {
  return (
    <main className="section-y">
      <div className="f-container space-y-10">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)] xl:gap-10">
          <article className="glass specular border-border/70 space-y-6 rounded-3xl border p-6 sm:p-8">
            <div className="space-y-3">
              <p className="text-muted-foreground/90 text-xs tracking-[0.3em] uppercase">
                {GUIDE_PRODUCT.eyebrow}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
                {GUIDE_PRODUCT.title}
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
                {GUIDE_PRODUCT.description}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                {GUIDE_PRODUCT.body}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {GUIDE_PRODUCT.bullets.map((bullet) => (
                <div
                  key={bullet}
                  className="border-border/70 bg-background/65 rounded-2xl border p-4 text-sm leading-relaxed"
                >
                  {bullet}
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-end gap-4 border-t border-border/60 pt-4">
              <div>
                <div className="text-muted-foreground text-xs uppercase tracking-[0.24em]">
                  Price
                </div>
                <div className="text-3xl font-semibold">{GUIDE_PRODUCT.priceLabel}</div>
              </div>
              <Link
                href={GUIDE_PRODUCT.checkoutPath}
                className="gbtn inline-flex h-11 items-center rounded-xl px-5 text-sm font-medium transition hover:opacity-95"
              >
                Buy now
              </Link>
            </div>
          </article>

          <aside className="glass-2 specular border-border/70 rounded-3xl border p-4 sm:p-5">
            <div className="border-border/60 relative aspect-[3/4] overflow-hidden rounded-2xl border bg-[#ede3d7]">
              <Image
                src={GUIDE_PRODUCT.coverImageSrc}
                alt={GUIDE_PRODUCT.title}
                fill
                priority
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 38vw"
              />
            </div>
            <div className="mt-4 space-y-3">
              <h2 className="text-lg font-semibold">What you’ll receive</h2>
              <ul className="text-muted-foreground space-y-2 text-sm leading-relaxed">
                {GUIDE_PRODUCT.includes.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-0.5 text-foreground">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
