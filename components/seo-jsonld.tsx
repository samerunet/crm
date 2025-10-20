'use client';

import Script from 'next/script';

export default function SeoJsonLd() {
  const base = 'https://crm-sable-iota.vercel.app';

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Fariia',
    alternateName: 'Fari Makeup',
    jobTitle: 'Makeup Artist',
    url: base,
    image: `${base}/og/hero.jpg`,
    areaServed: ['San Diego, CA', 'Orange County, CA', 'Los Angeles, CA', 'Destination'],
    makesOffer: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Bridal Makeup' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Editorial/Fashion Makeup' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Private Lessons' } },
    ],
    sameAs: ['https://www.instagram.com/fari_makeup'],
  };

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: base },
      { '@type': 'ListItem', position: 2, name: 'Services', item: `${base}/services` },
      { '@type': 'ListItem', position: 3, name: 'Portfolio', item: `${base}/portfolio` },
      { '@type': 'ListItem', position: 4, name: 'Reviews', item: `${base}/reviews` },
      { '@type': 'ListItem', position: 5, name: 'FAQ', item: `${base}/faq` },
      { '@type': 'ListItem', position: 6, name: 'About', item: `${base}/about` },
    ],
  };

  return (
    <>
      <Script
        id="jsonld-person"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }}
      />
      <Script
        id="jsonld-breadcrumbs"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
    </>
  );
}
