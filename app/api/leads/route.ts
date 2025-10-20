export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const take = Math.min(Number(searchParams.get('take') ?? 25), 100);
  const cursor = searchParams.get('cursor');
  const q = searchParams.get('q')?.trim();
  const where = q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }, { message: { contains: q, mode: 'insensitive' } }] } : undefined;
  const rows = await prisma.lead.findMany({
    where,
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, message: true, source: true, createdAt: true }
  });
  const nextCursor = rows.length > take ? rows[take].id : null;
  return NextResponse.json({ items: rows.slice(0, take), nextCursor });
}

export async function POST(req: Request) {
  try {
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
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'invalid' }, { status: 400 });
  }
}
