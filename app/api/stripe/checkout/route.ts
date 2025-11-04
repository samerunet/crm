import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'

export async function POST(req: Request){
  if(!stripe) return NextResponse.json({ error:'Stripe not configured' }, { status:400 })
  const { email, name, slug } = await req.json()
  const origin = req.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const priceId = process.env.STRIPE_PRICE_GUIDE
  const amount = parseInt(process.env.GUIDE_PRICE_CENTS || '2999', 10)
  const params: Stripe.Checkout.SessionCreateParams = {
    mode:'payment',
    success_url: `${origin}/guide/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/banner/guide?canceled=1`,
    allow_promotion_codes: true,
    customer_email: email || undefined,
    metadata: { name: name || '', slug: slug || 'makeup-guide' },
    line_items: priceId ? [{ price: priceId, quantity: 1 }] : [{
      price_data: {
        currency: 'usd',
        unit_amount: amount,
        product_data: { name: 'Makeup Guide' }
      },
      quantity: 1
    }],
    automatic_tax: { enabled: false }
  }
  const session = await stripe.checkout.sessions.create(params)
  if (!session.url) return NextResponse.json({ error:'No checkout URL from Stripe' }, { status:500 })
  return NextResponse.json({ url: session.url })
}
