'use client'
import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string)

function Form(){
  const stripe = useStripe()
  const elements = useElements()
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if(!stripe || !elements) return
    setLoading(true)
    setError(null)
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/guide/thanks` },
      redirect: 'if_required'
    })
    if(error) setError(error.message || 'Payment failed')
    setLoading(false)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="p-4 rounded-[var(--radius-xl)] border border-[var(--border)] bg-transparent">
        <PaymentElement />
      </div>
      {error ? <div className="text-red-600 text-sm">{error}</div> : null}
      <button
        disabled={!stripe || loading}
        className="gbtn w-full h-12 rounded-[var(--radius-xl)] grid place-items-center font-medium"
      >
        {loading ? 'Processing…' : 'Pay $29.99'}
      </button>
    </form>
  )
}

export default function GuidePaymentForm(){
  const [clientSecret,setClientSecret] = useState<string | null>(null)

  useEffect(()=>{
    fetch('/api/payments/intent', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ product:'makeup-guide' })
    })
    .then(r=>r.json())
    .then(d=>setClientSecret(d.clientSecret))
    .catch(()=>setClientSecret(null))
  },[])

  if(!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY){
    return <div className="opacity-80 text-sm">Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</div>
  }

  const options = clientSecret ? {
    clientSecret,
    appearance:{
      theme:'none',
      variables:{
        colorPrimary:'#6C3A22',
        colorBackground:'transparent',
        colorText:'#120D0A',
        borderRadius:'10px'
      }
    }
  } : undefined

  return options
    ? <Elements stripe={stripePromise!} options={options}><Form/></Elements>
    : <div className="opacity-80 text-sm">Loading secure checkout…</div>
}
