import type { Metadata } from 'next';

import BookClient from './BookClient';

export const metadata: Metadata = {
  title: 'Book Now — Fari Makeup',
  description: 'Open the booking form and send a quick inquiry.',
  alternates: { canonical: '/book' },
};

type SearchParams = {
  service?: string | string[];
  serviceId?: string | string[];
};

export default function BookPage({ searchParams }: { searchParams?: SearchParams }) {
  const serviceParam =
    typeof searchParams?.service === 'string' ? searchParams.service : undefined;
  const serviceIdParam =
    typeof searchParams?.serviceId === 'string' ? searchParams.serviceId : undefined;

  return <BookClient serviceTitle={serviceParam} serviceId={serviceIdParam} />;
}
