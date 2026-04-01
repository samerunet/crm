import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { sendGuidePurchaseNotification } from '@/lib/guide-purchase-notifications'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request){
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const key = process.env.STRIPE_SECRET_KEY
  if (!secret || !key) return new NextResponse('Missing Stripe secrets', { status: 400 })

  const signature = headers().get('stripe-signature') || ''
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
      const email = session.customer_details?.email ?? session.customer_email ?? ''
      const name =
        session.customer_details?.name ??
        session.metadata?.customer_name ??
        session.metadata?.name ??
        null
      const amount = session.amount_total ?? 0
      const currency = session.currency ?? 'usd'
      const status = session.payment_status === 'paid' ? 'COMPLETED' : 'PENDING'
      const slug = session.metadata?.slug ?? 'makeup-guide'
      const existingOrder = await prisma.order.findFirst({ where:{ externalRef: session.id } })
      if (existingOrder) break
      const user = email ? await prisma.user.upsert({ where:{ email }, create:{ email, name }, update:{ name: name ?? undefined } }) : null
      const guide = await prisma.guide.findUnique({ where:{ slug } })
      await prisma.order.create({
        data:{
          userId: user?.id,
          guideId: guide?.id,
          amountCents: amount,
          currency,
          status,
          externalRef: session.id
        }
      })
      if (status === 'COMPLETED') {
        try {
          await sendGuidePurchaseNotification({
            buyerEmail: email,
            buyerName: name,
            guideTitle: guide?.title ?? session.metadata?.productName ?? 'Makeup Guide',
            amountCents: amount,
            currency,
            sessionId: session.id,
          })
        } catch (notifyErr: any) {
          console.error('Guide purchase notification failed:', notifyErr?.message || notifyErr)
        }
      }
      break
    }
    default:
      break
  }

  return NextResponse.json({ received: true })
}
