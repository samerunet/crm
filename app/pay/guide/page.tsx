import Image from 'next/image'
import Link from 'next/link'

import StartCheckoutButton from '@/components/StartCheckoutButton'
import { GUIDE_PRODUCT } from '@/lib/guide-product'

export const metadata = { title: `Secure Checkout — ${GUIDE_PRODUCT.title}` }

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>
}){
  const params = await searchParams
  return (
    <div className="f-container section-y">
      <div className="glass rounded-[var(--radius-xl)] p-8 md:p-12 max-w-5xl mx-auto">
        <div className="grid gap-8 lg:grid-cols-[minmax(320px,0.95fr)_minmax(0,1.05fr)] lg:items-start">
          <aside className="space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--radius-xl)] border border-border/60 bg-[#ede3d7]">
              <Image
                src={GUIDE_PRODUCT.coverImageSrc}
                alt={GUIDE_PRODUCT.title}
                fill
                className="object-cover object-top"
                sizes="(max-width: 1024px) 100vw, 34vw"
              />
            </div>
            <Link href="/guides" className="text-sm underline underline-offset-4 opacity-80">
              Back to guide details
            </Link>
          </aside>

          <div>
            <div className="mb-6">
              <div className="text-xs uppercase tracking-wider opacity-80">Secure Checkout</div>
              <h1 className="text-3xl md:text-4xl font-semibold">Buy “{GUIDE_PRODUCT.title}”</h1>
              <p className="opacity-90 mt-2">
                Apple Pay, Google Pay, and cards via Stripe Checkout.
              </p>
            </div>
            {params.canceled === '1' ? (
              <div className="mb-4 rounded-[var(--radius-xl)] border border-amber-500/30 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Checkout was canceled. You can restart payment any time below.
              </div>
            ) : null}
            <div className="mb-4 text-sm opacity-80">
              After successful payment, you’ll return to a confirmation page and we’ll receive your order details.
            </div>
            <StartCheckoutButton
              amountCents={GUIDE_PRODUCT.priceCents}
              productName={GUIDE_PRODUCT.title}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
