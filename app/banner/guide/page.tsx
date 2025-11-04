import { stripe } from '@/lib/stripe'
import CheckoutForm from '@/components/CheckoutForm'

export const metadata = { title: 'Makeup Guide — Banner' }

export default async function Page() {
  const intent = await stripe.paymentIntents.create({
    amount: 2999,
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
    metadata: { product: 'makeup-guide', source: 'banner' },
  })
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''

  return (
    <div className="f-container section-y">
      <div className="glass rounded-[var(--radius-xl)] p-10 md:p-14">
        <div className="flex flex-col items-start gap-10 md:flex-row md:gap-14">
          <div className="flex-1">
            <div className="mb-2 text-xs tracking-wider uppercase opacity-80">Exclusive PDF</div>
            <h1 className="mb-4 text-4xl font-semibold md:text-6xl">The Makeup Guide</h1>
            <p className="mb-6 max-w-prose opacity-90">Instant access after purchase. Secure checkout with cards and wallets.</p>
            <div className="max-w-sm">
              <CheckoutForm clientSecret={intent.client_secret!} publishableKey={publishableKey} />
            </div>
            <div className="mt-3 text-sm opacity-80">If a wallet is available, Apple Pay or Google Pay will appear automatically.</div>
          </div>

          <div className="w-full md:w-[560px]">
            <div className="glass-2 rounded-[var(--radius-xl)] p-8">
              <div className="mb-3 text-xl font-medium">What’s inside</div>
              <ul className="space-y-2 text-sm opacity-90">
                <li>Step-by-step bridal looks</li>
                <li>Kit checklist and pro tips</li>
                <li>Lifetime updates</li>
              </ul>
              <div className="mt-6 text-5xl font-semibold">$29<span className="align-top text-base">.99</span></div>
              <div className="mt-2 text-sm opacity-80">One-time purchase</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
