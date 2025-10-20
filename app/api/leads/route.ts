export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-edge';
export async function POST(req: Request) {
  const body = await req.json();
  const lead = await prisma.lead.create({
    data: {
      name: body.name ?? null,
      email: body.email ?? null,
      message: body.message ?? null,
      source: body.source ?? 'homepage'
    }
  });
  return NextResponse.json(lead, { status: 201 });
}
