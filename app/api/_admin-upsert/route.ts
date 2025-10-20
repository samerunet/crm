export const runtime = 'nodejs'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma-node'
export async function GET(req: Request) {
  const u = new URL(req.url)
  const email = u.searchParams.get('email') || 'admin@farimakeup.com'
  const name  = u.searchParams.get('name')  || 'Fari Admin'
  const now = new Date()
  const user = await prisma.user.upsert({
    where:{ email },
    update:{ role:'admin', name, updatedAt:now },
    create:{ email, name, role:'admin', createdAt:now, updatedAt:now }
  })
  return NextResponse.json({ ok:true, user })
}
