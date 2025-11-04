'use client'
import { useState } from 'react'

type Props = { email?: string; name?: string; slug?: string }

export default function BuyNowButton({ email, name, slug='makeup-guide' }: Props){
  const [loading, setLoading] = useState(false)
  async function go(){
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ email, name, slug })
    })
    if (res.ok){
      const data = await res.json()
      if (data.url) window.location.href = data.url
    }
    setLoading(false)
  }
  return (
    <button onClick={go} disabled={loading} className="gbtn rounded-xl px-6 py-3">
      {loading ? 'Redirecting…' : 'Buy now'}
    </button>
  )
}
