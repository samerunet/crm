import type { ReactNode } from 'react';

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session) redirect('/auth/sign-in?callbackUrl=/dashboard');
  const role = (session.user as any)?.role ?? 'USER';
  if (role === 'ADMIN') redirect('/admin');
  return <>{children}</>;
}
