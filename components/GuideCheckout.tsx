'use client'
import { useState } from 'react'
const slug = 'makeup-guide'
export default function GuideCheckout(){
  const [name,setName] = useState('')
  const [email,setEmail] = useState('')
  const [loading,setLoading] = useState(false)
  const mode = process.env.NEXT_PUBLIC_PAYMENTS_MODE || 'demo'
  async function startStripe(){
    if(!email) return alert('Enter your email')
    setLoading(true)
    try{
      const r = await fetch('/api/stripe/checkout', { method:'POST', headers:{ 'content-type':'application/json' }, body: JSON.stringify({ email, name, slug }) })
      const json = await r.json()
      if(!r.ok || !json.url) throw new Error(json.error || 'Unable to start checkout')
      window.location.href = json.url
    }catch(e:any){
      setLoading(false)
      alert(e.message)
    }
  }
  function startDemo(){
    const q = new URLSearchParams({ demo:'1', email: email || '', name: name || '', slug }).toString()
    window.location.href = `/guide/thanks?${q}`
  }
  const showStripe = mode === 'stripe'
  return (
    <div className="w-full">
      <div className="glass rounded-[var(--radius-xl)] p-8 md:p-12">
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-semibold mb-3">Get the Makeup Guide</h1>
            <p className="opacity-90 mb-6">Instant access after payment. Secure checkout by Stripe.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Your name" className="w-full rounded-[var(--radius-lg)] px-4 py-3 bg-popover/60 border" />
              <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="Email" className="w-full rounded-[var(--radius-lg)] px-4 py-3 bg-popover/60 border" />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {showStripe ? (
                <button onClick={startStripe} disabled={loading || !email} className="gbtn rounded-[var(--radius-lg)] px-6 py-3 min-w-[220px] disabled:opacity-60">{loading ? 'Redirecting…' : 'Buy Now'}</button>
              ) : (
                <button onClick={startDemo} className="gbtn rounded-[var(--radius-lg)] px-6 py-3 min-w-[220px]">Try Demo Purchase</button>
              )}
              <a href="/" className="rounded-[var(--radius-lg)] px-6 py-3 border inline-flex items-center justify-center">Back to site</a>
            </div>
            <p className="text-sm opacity-80 mt-4">Apple Pay / Google Pay show on the Stripe page when available.</p>
          </div>
          <div className="w-full md:w-[480px]">
            <div className="glass-2 rounded-[var(--radius-xl)] p-6">
              <div className="text-xl font-medium mb-2">What’s inside</div>
              <ul className="space-y-2 text-sm opacity-90">
                <li>Step-by-step bridal/luxury looks</li>
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
