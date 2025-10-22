'use client';
import React from 'react';

export default function SEOJsonLD({ canonical = 'https://farimakeup.com' }: { canonical?: string }) {
  const org = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Fari Makeup',
    url: canonical,
    logo: `${canonical}/favicon.svg`,
  };

  const service = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'Fari Makeup',
    url: canonical,
    image: `${canonical}/og.jpg`,
    areaServed: [
      { '@type': 'City', name: 'San Diego' },
      { '@type': 'City', name: 'Orange County' },
      { '@type': 'City', name: 'Los Angeles' },
    ],
    description:
      'Bridal makeup and modern soft glam across San Diego, Orange County, and Los Angeles. Luxury skin prep, long-lasting looks, on-location service, and a calm, professional experience.',
    availableChannel: { '@type': 'ServiceChannel', serviceUrl: `${canonical}/services` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }}
      />
    </>
  );
}
