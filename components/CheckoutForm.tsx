'use client'
import { useEffect, useMemo, useState } from 'react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

function InnerForm({ clientSecret, appearance }: { clientSecret: string, appearance: any }) {
  const stripe = useStripe()
  const elements = useElements()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setLoading(true)
    setError(null)
    const { error: submitError } = await elements.submit()
    if (submitError) { setError(submitError.message || 'Payment details error'); setLoading(false); return }
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/guide/thanks?email=${encodeURIComponent(email)}`,
        payment_method_data: { billing_details: { email, name } },
      },
    })
    if (error) { setError(error.message || 'Payment failed'); setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        required
        placeholder="Email"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        className="w-full rounded-[var(--radius)] border border-[var(--color-border)] bg-[rgba(255,255,255,.7)]/50 px-3 py-2 text-[var(--foreground)]"
      />
      <input
        type="text"
        placeholder="Name (optional)"
        value={name}
        onChange={(e)=>setName(e.target.value)}
        className="w-full rounded-[var(--radius)] border border-[var(--color-border)] bg-[rgba(255,255,255,.7)]/50 px-3 py-2 text-[var(--foreground)]"
      />
      <div className="rounded-[var(--radius)] border border-[var(--color-border)] bg-[rgba(255,255,255,.6)] p-3">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>
      {error && <div className="text-sm text-[var(--destructive)]">{error}</div>}
      <button
        disabled={!stripe || loading}
        className="gbtn rounded-[var(--radius)] px-4 py-2"
        type="submit"
      >
        {loading ? 'Processing…' : 'Buy Now'}
      </button>
      <div className="text-xs opacity-80">Apple Pay / Google Pay show automatically when available.</div>
    </form>
  )
}

export default function CheckoutForm({ clientSecret, publishableKey }:{
  clientSecret: string
  publishableKey: string
}) {
  const stripePromise = useMemo(()=>loadStripe(publishableKey), [publishableKey])
  const appearance = useMemo(()=>({
    theme: 'none',
    variables: {
      colorPrimary: getComputedStyle(document.documentElement).getPropertyValue('--primary') || '#6C3A22',
      colorBackground: 'transparent',
      colorText: getComputedStyle(document.documentElement).getPropertyValue('--foreground') || '#120D0A',
      colorDanger: '#7F5539',
      borderRadius: '10px',
    },
    rules: {
      '.Input': { border: '1px solid var(--color-border)', backgroundColor: 'rgba(255,255,255,.65)', boxShadow: 'none' },
      '.Tab, .Block': { backgroundColor: 'rgba(255,255,255,.55)', borderRadius: '10px', border: '1px solid var(--color-border)' },
      '.Label': { color: 'var(--foreground)' },
    },
  }), [])

  if (!clientSecret) return null
  return (
    <Elements options={{ clientSecret, appearance, loader: 'never' }} stripe={stripePromise}>
      <InnerForm clientSecret={clientSecret} appearance={appearance} />
    </Elements>
  )
}
