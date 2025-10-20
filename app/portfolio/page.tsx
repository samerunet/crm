import type { Metadata } from 'next';

import PortfolioClient from './_components/portfolio-client';

export const metadata: Metadata = {
  title: 'Portfolio — Bridal & Event Makeup Gallery (San Diego, OC, LA)',
  description:
    'Curated looks from real brides, destination weddings & fashion shoots with flawless, soft-glam makeup across San Diego, OC & LA.',
  alternates: { canonical: '/portfolio' },
};

export default function PortfolioPage() {
  return <PortfolioClient />;
}
