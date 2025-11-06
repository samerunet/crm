import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: '2024-06-20' })

export async function POST(req: Request){
  try{
    const { product } = await req.json().catch(()=>({}))
    const amount = 2999
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency:'usd',
      automatic_payment_methods:{ enabled:true },
      metadata:{ product: product || 'makeup-guide' }
    })
    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  }catch(e:any){
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
