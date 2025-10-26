import type { Metadata } from 'next';
import SignInForm from './sign-in-form';

export const metadata: Metadata = {
  title: 'Sign in — Fari Makeup Client Access',
  description: 'Sign in to manage your bookings and purchases with Fari Makeup.',
  alternates: { canonical: '/auth/sign-in' },
};

export default function SignInPage() {
  return <SignInForm />;
}
