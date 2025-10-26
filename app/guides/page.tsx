import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guides — Templates Launching Soon',
  description: 'Guides and templates launching soon. Join the waitlist.',
  alternates: { canonical: '/guides' },
};

export default function Page() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-3xl md:text-4xl font-semibold mb-4">Guides</h1>
      <p className="text-white/80">Guides and templates launching soon. Join the waitlist.</p>
    </main>
  );
}
