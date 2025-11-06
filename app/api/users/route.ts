export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma-node';
import { auth } from '@/lib/auth';
export async function GET(req: NextRequest) {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session || (role !== 'ADMIN' && role !== 'MANAGER')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const take = Math.min(Number(searchParams.get('take') ?? 25), 100);
  const cursor = searchParams.get('cursor');
  const q = searchParams.get('q')?.trim();
  const where: Prisma.UserWhereInput | undefined = q
    ? {
        OR: [
          { name: { contains: q, mode: Prisma.QueryMode.insensitive } },
          { email: { contains: q, mode: Prisma.QueryMode.insensitive } },
        ],
      }
    : undefined;
  const rows = await prisma.user.findMany({
    where,
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });
  const nextCursor = rows.length > take ? rows[take]!.id : null;
  return NextResponse.json({ users: rows.slice(0, take), nextCursor });
}
