import StartCheckoutButton from '@/components/StartCheckoutButton'

export const metadata = { title: 'Secure Checkout — Makeup Guide' }

export default function Page(){
  return (
    <div className="f-container section-y">
      <div className="glass rounded-[var(--radius-xl)] p-10 md:p-14 max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-wider opacity-80">Secure Checkout</div>
          <h1 className="text-3xl md:text-4xl font-semibold">Buy “The Makeup Guide”</h1>
          <p className="opacity-90 mt-2">Apple Pay, Google Pay, and cards via Stripe Checkout.</p>
        </div>
        <StartCheckoutButton amountCents={2999} productName="The Makeup Guide" />
      </div>
    </div>
  )
}
