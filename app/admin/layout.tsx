import type { ReactNode } from 'react';

import '@/styles/admin-surfaces.css';

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session) redirect('/auth/sign-in?callbackUrl=/admin');
  const role = (session.user as any)?.role ?? 'USER';
  if (role !== 'ADMIN') redirect('/dashboard');
  return <>{children}</>;
}
