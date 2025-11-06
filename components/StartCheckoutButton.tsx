'use client'
import { useState } from 'react'

export default function StartCheckoutButton({
  amountCents = 2999,
  productName = 'The Makeup Guide',
}:{
  amountCents?: number
  productName?: string
}){
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)

  const start = async () => {
    setLoading(true); setError(null)
    try{
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountCents, productName })
      })
      const data = await res.json()
      if(!res.ok || !data.url) throw new Error(data.error || 'Checkout init failed')
      window.location.assign(data.url)
    } catch (e:any){
      setError(e.message); setLoading(false)
    }
  }

  return (
    <div>
      {error ? <div className="text-sm text-red-600 mb-3">{error}</div> : null}
      <button
        onClick={start}
        disabled={loading}
        className="gbtn w-full h-12 rounded-[var(--radius-xl)] grid place-items-center font-medium"
      >
        {loading ? 'Redirecting…' : 'Pay $29.99'}
      </button>
    </div>
  )
}
