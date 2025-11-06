import { NextResponse } from 'next/server'
import { stripe } from "@/lib/stripe"

export async function POST(req: Request){
  try{
    if (!stripe) {
      return NextResponse.json({ error: "Stripe secret key not configured" }, { status: 500 });
    }
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
