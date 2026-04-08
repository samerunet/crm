import { prisma } from './prisma'
import { stripe } from './stripe'
const isStripe = process.env.PAYMENTS_MODE === 'stripe'
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
export async function createCheckoutSession(args:{email:string,name?:string,slug?:string,priceId?:string}){
  const { email, name, slug, priceId } = args
  if(!isStripe || !stripe){
    const url = `${appUrl}/guide/thanks?demo=1&email=${encodeURIComponent(email||'')}&name=${encodeURIComponent(name||'')}&slug=${encodeURIComponent(slug||'makeup-guide')}`
    return { url }
  }
  const session = await stripe.checkout.sessions.create({
    mode:'payment',
    allow_promotion_codes: true,
    payment_method_types:['card'],
    line_items:[{ price: priceId || process.env.STRIPE_PRICE_GUIDE!, quantity:1 }],
    customer_email: email,
    metadata:{ name: name || '', slug: slug || 'makeup-guide' },
    success_url: `${appUrl}/guide/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/banner/guide?canceled=1`,
  })
  return { url: session.url! }
}
export async function handleWebhook(body: string, signature: string | null){
  if(!isStripe || !stripe) return { ok:true }
  const secret = process.env.STRIPE_WEBHOOK_SECRET as string
  const event = stripe.webhooks.constructEvent(body, signature as string, secret)
  if(event.type==='checkout.session.completed'){
    const s = event.data.object as any
    const email = s.customer_details?.email || s.customer_email || ''
    const name = s.metadata?.name || null
    const slug = s.metadata?.slug || 'makeup-guide'
    const amount = s.amount_total ?? 0
    const currency = s.currency ?? 'usd'
    const user = email ? await prisma.user.upsert({ where:{ email }, create:{ email, name }, update:{} }) : null
    const guide = await prisma.guide.findUnique({ where:{ slug } })
    await prisma.order.create({ data:{ userId:user?.id, guideId:guide?.id, amountCents:amount, currency, status:'COMPLETED', externalRef:s.id }})
  }
  return { ok:true }
}
