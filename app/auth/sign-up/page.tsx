import type { Metadata } from 'next';
import SignUpForm from './sign-up-form';

export const metadata: Metadata = {
  title: 'Create Account — Fari Makeup Client Access',
  description:
    'Create a client account to manage purchases, booking, and access to Fari Makeup services.',
  alternates: { canonical: '/auth/sign-up' },
};

export default function SignUpPage() {
  return <SignUpForm />;
}
