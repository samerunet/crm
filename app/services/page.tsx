import type { Metadata } from 'next';

import ServicesClient from './_components/services-client';

export const metadata: Metadata = {
  title: 'Makeup Services: Bridal, Editorial & Event – San Diego',
  description:
    'Bridal trials, day-of makeup, bridesmaids, editorial/photoshoots & private lessons. On-location across San Diego, Orange County, Los Angeles & destination weddings.',
  alternates: { canonical: '/services' },
};

export default function ServicesPage() {
  return <ServicesClient />;
}
