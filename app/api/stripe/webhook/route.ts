import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { fulfillGuideCheckoutSession } from '@/lib/guide-purchase-fulfillment'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request){
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const key = process.env.STRIPE_SECRET_KEY
  if (!secret || !key) return new NextResponse('Missing Stripe secrets', { status: 400 })

  const signature = req.headers.get('stripe-signature') || ''
  const body = await req.text()

  const stripe = new Stripe(key, { apiVersion: '2024-06-20' })
  let event: Stripe.Event

  try{
    event = stripe.webhooks.constructEvent(body, signature, secret)
  }catch(err: any){
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  switch(event.type){
    case 'checkout.session.completed':{
      const session = event.data.object as Stripe.Checkout.Session
      await fulfillGuideCheckoutSession(session)
      break
    }
    default:
      break
  }

  return NextResponse.json({ received: true })
}
