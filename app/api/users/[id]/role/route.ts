import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma-node';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
  }

  let role: string | undefined;
  try {
    const body = await req.json();
    role = typeof body?.role === 'string' ? body.role.toUpperCase() : undefined;
  } catch {
    role = undefined;
  }

  if (!role || !['ADMIN', 'MANAGER', 'USER'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  await prisma.user.update({
    where: { id },
    data: { role },
  });

  return NextResponse.json({ ok: true });
}
