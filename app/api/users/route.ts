export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-edge';
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const take = Math.min(Number(searchParams.get('take') ?? 25), 100);
  const cursor = searchParams.get('cursor');
  const q = searchParams.get('q')?.trim();
  const where = q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] } : undefined;
  const rows = await prisma.user.findMany({
    where,
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, image: true, createdAt: true }
  });
  const nextCursor = rows.length > take ? rows[take].id : null;
  return NextResponse.json({ items: rows.slice(0, take), nextCursor });
}
export async function POST(req: Request) {
  const body = await req.json();
  const user = await prisma.user.create({
    data: {
      name: body.name ?? null,
      email: body.email ?? null,
      image: body.image ?? null,
      role: body.role ?? 'user'
    }
  });
  return NextResponse.json(user, { status: 201 });
}
