import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/payments'
export const runtime = 'nodejs'
export async function POST(req: NextRequest){
  try{
    const { email, name, slug, priceId } = await req.json()
    const { url } = await createCheckoutSession({ email, name, slug, priceId })
    return NextResponse.json({ url })
  }catch(e:any){
    return NextResponse.json({ message: e.message || 'Error creating checkout' }, { status: 400 })
  }
}
