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
    telephone: '+1-619-399-6160',
    priceRange: '$$-$$$',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'San Diego',
      addressRegion: 'CA',
      addressCountry: 'US',
    },
    serviceType: 'Luxury bridal makeup and beauty services',
    areaServed: [
      { '@type': 'City', name: 'San Diego' },
      { '@type': 'City', name: 'Orange County' },
      { '@type': 'City', name: 'Los Angeles' },
    ],
    knowsAbout: [
      'Bridal makeup',
      'Soft glam makeup',
      'Beauty salon services',
      'On-location glam team',
      'Hairstyling for weddings',
    ],
    description:
      'Bridal makeup and modern soft glam across San Diego, Orange County, and Los Angeles. Luxury skin prep, long-lasting looks, on-location service, and a calm, professional experience.',
    offers: [
      {
        '@type': 'Offer',
        name: 'Bridal Makeup Package',
        priceCurrency: 'USD',
        price: '380',
        availability: 'https://schema.org/InStock',
        url: `${canonical}/services`,
      },
      {
        '@type': 'Offer',
        name: 'Glam Team & Hairstyling Add-ons',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
        url: `${canonical}/services`,
      },
    ],
    sameAs: [
      'https://www.instagram.com/fari_makeup/',
      'https://www.pinterest.com/fari_makeup/',
      'https://www.tiktok.com/@fari_makeup',
    ],
  };

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Fariia (Fari) Sipahi',
    jobTitle: 'Makeup Artist',
    url: canonical,
    image: `${canonical}/images/IMG_1381.JPG`,
    description:
      'San Diego-based makeup artist delivering refined bridal looks, luxury soft glam, and calm, on-location beauty services with full glam team support.',
    telephone: '+1-619-399-6160',
    worksFor: { '@type': 'ProfessionalService', name: 'Fari Makeup' },
    knowsAbout: [
      'Bridal makeup artistry',
      'Editorial beauty looks',
      'South Asian bridal glam',
      'Camera-ready complexion work',
      'Hairstyling coordination',
    ],
    sameAs: [
      'https://www.instagram.com/fari_makeup/',
      'https://www.linkedin.com/in/fariia-makeup/',
      'https://www.tiktok.com/@fari_makeup',
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(service) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
    </>
  );
}
