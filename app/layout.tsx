// app/layout.tsx
import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppProviders from '@/components/ui/app-providers';
import AnalyticsEvents from '@/components/ui/analytics-events';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'], display: 'swap' });
const SITE_URL = new URL('https://farimakeup.com');
const SITE_TITLE =
  'San Diego Makeup Artist — Bridal, Luxury Soft & Full Glam in San Diego, OC & LA';
const SITE_DESCRIPTION =
  'Luxury bridal and special event makeup artistry serving San Diego, Orange County, and Los Angeles with signature soft glam, perfected skin prep, and on-location service.';

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'San Diego Makeup ',
  alternateName: 'San Diego Makeup Artist Fari— Bridal & Luxury Glam',
  url: 'https://farimakeup.com/',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://farimakeup.com/?s={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'San Diego Makeup Artist Fari',
  url: 'https://farimakeup.com/',
  logo: 'https://farimakeup.com/logo.png',
  sameAs: ['https://www.instagram.com/fari_makeup', 'https://www.pinterest.com/farimakeup'],
};

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: 'https://farimakeup.com',
    languages: {
      'en-US': 'https://farimakeup.com',
    },
  },
  applicationName: 'San Diego Makeup Artist Fari',
  authors: [{ name: 'Fari Makeup' }],
  creator: 'Fari Makeup',
  publisher: 'Fari Makeup',
  keywords: [
    // Brand
    'Fari Makeup',
    'Fariia Makeup',
    'Fari Makeup Artistry',
    'Fari Makeup Studio',
    'Fari Makeup San Diego',

    // Core services (kept + expanded)
    'bridal makeup',
    'wedding makeup artist',
    'soft glam',
    'natural makeup',
    'luxury makeup',
    'Full Glam',
    'event makeup',
    'photoshoot makeup',
    'engagement makeup',
    'maternity photoshoot makeup',
    'prom makeup',
    'homecoming makeup',
    'quinceañera makeup',
    'makeup for mature skin',
    'makeup for tan skin',
    'airbrush makeup',
    'HD makeup',
    'dewy makeup',
    'matte makeup',
    'editorial makeup',
    'red carpet makeup',
    'makeup trial',
    'bridal makeup trial',
    'lashes included',
    'false lashes application',
    'brow shaping',
    'contour and highlight',
    'makeup lessons',
    'one-on-one makeup lesson',
    'group makeup class',
    'mobile makeup artist',
    'on-site makeup artist',
    'luxury bridal makeup',
    'natural bridal makeup',
    'soft glam bridal makeup',
    'bridal hair and makeup',
    'wedding hair and makeup',
    'hairstyling',
    'updo hairstyling',
    'hollywood waves',

    // Specialty & cultural
    'South Asian bridal makeup',
    'Indian bridal makeup',
    'Pakistani bridal makeup',
    'Persian bridal makeup',
    'Afghan bridal makeup',
    'Arabic bridal makeup',
    'Armenian bridal makeup',
    'Middle Eastern glam',
    'hijab-friendly makeup artist',

    // Commercial/intent queries
    'bridal makeup near me',
    'makeup artist near me',
    'best makeup artist San Diego',
    'top rated makeup artist San Diego',
    'affordable bridal makeup San Diego',
    'luxury bridal makeup San Diego',
    'wedding makeup packages',
    'bridal makeup packages',
    'wedding makeup price',
    'wedding makeup cost',
    'book wedding makeup artist',
    'same day makeup artist',
    'last minute wedding makeup',

    // Location hubs (kept + expanded)
    'San Diego',
    'makeup artist San Diego',
    'San Diego makeup artist',
    'bridal makeup San Diego',
    'wedding makeup San Diego',
    'mobile makeup San Diego',
    'La Jolla makeup artist',
    'Del Mar makeup artist',
    'Coronado makeup artist',
    'Chula Vista makeup artist',
    'Escondido makeup artist',
    'Carlsbad makeup artist',
    'Oceanside makeup artist',
    'Temecula makeup artist',

    'Orange County',
    'makeup artist Orange County',
    'bridal makeup Orange County',
    'Irvine makeup artist',
    'Newport Beach makeup artist',
    'Costa Mesa makeup artist',
    'Anaheim makeup artist',
    'Laguna Beach makeup artist',
    'Huntington Beach makeup artist',

    'Los Angeles',
    'makeup artist Los Angeles',
    'bridal makeup Los Angeles',
    'Beverly Hills makeup artist',
    'West Hollywood makeup artist',
    'Pasadena makeup artist',
    'Glendale makeup artist',

    // Use cases / moments
    'engagement photos makeup',
    'bridal shower makeup',
    'bachelorette makeup',
    'headshot makeup',
    'brand photoshoot makeup',
    'micro-wedding makeup',
    'elopement makeup',
    'destination wedding makeup',

    // Multilingual (reach local communities)
    'maquillista San Diego',
    'maquillista de novias San Diego',
    'maquillaje para bodas San Diego',
    'maquillista a domicilio San Diego',
    'макияж Сан-Диего',
    'визажист Сан-Диего',
    'визажист на свадьбу Сан-Диего',
    'آرایشگر عروس سن دیگو',
  ],

  openGraph: {
    type: 'website',
    url: 'https://farimakeup.com',
    siteName: 'San Diego Makeup Artist Fariia',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og.jpg',
        width: 1200,
        height: 630,
        alt: SITE_TITLE,
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/og.jpg'],
  },
  manifest: '/site.webmanifest',
  category: 'beauty',
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: ['/logo.svg'],
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="fari-light">
      <head>
        <meta property="og:site_name" content="Fari Makeup" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link
          rel="preload"
          as="image"
          href="/portfolio/12-hero.webp"
          type="image/webp"
          imageSrcSet="/portfolio/12-hero.webp 1x, /portfolio/12-hero.jpg 2x"
          imageSizes="100vw"
          fetchPriority="high"
        />
        <Script id="gtm-base" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-P7CW6ZTN');`}
        </Script>
        <Script id="ld-json-website" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(websiteSchema)}
        </Script>
        <Script id="ld-json-organization" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(organizationSchema)}
        </Script>
      </head>
      <body className={inter.className}>
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              '<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-P7CW6ZTN" height="0" width="0" style="display:none;visibility:hidden"></iframe>',
          }}
        />
        <AppProviders>
          <Navbar />
          {children}
          <Footer />
          <AnalyticsEvents />
        </AppProviders>
        <SpeedInsights />
      </body>
    </html>
  );
}
