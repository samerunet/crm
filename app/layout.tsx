// app/layout.tsx
import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppProviders from '@/components/ui/app-providers';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });
const SITE_URL = new URL('https://farimakeup.com');
const SITE_TITLE = 'Fari Makeup — Bridal & Luxury Soft Glam in San Diego, OC & LA';
const SITE_DESCRIPTION =
  'Luxury bridal and special event makeup artistry serving San Diego, Orange County, and Los Angeles with signature soft glam, perfected skin prep, and on-location service.';

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Fari Makeup',
  alternateName: 'Fari Makeup — Bridal & Luxury Soft Glam',
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
  name: 'Fari Makeup',
  url: 'https://farimakeup.com/',
  logo: 'https://farimakeup.com/logo.png',
  sameAs: [
    'https://www.instagram.com/fari_makeup',
    'https://www.pinterest.com/farimakeup',
  ],
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
  applicationName: 'Fari Makeup',
  authors: [{ name: 'Fari Makeup' }],
  creator: 'Fari Makeup',
  publisher: 'Fari Makeup',
  keywords: [
    'Fari Makeup',
    'Fariia Makeup',
    'bridal makeup',
    'soft glam',
    'natural makeup',
    'luxury makeup',
    'wedding makeup artist',
    'San Diego',
    'Orange County',
    'Los Angeles',
  ],
  openGraph: {
    type: 'website',
    url: 'https://farimakeup.com',
    siteName: 'Fari Makeup',
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
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: ['/favicon.ico'],
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
        <link
          rel="preload"
          as="image"
          href="/portfolio/12.JPG"
          imageSizes="100vw"
          fetchPriority="high"
        />
        <Script id="gtm-base" strategy="beforeInteractive">
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
            __html: '<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-P7CW6ZTN" height="0" width="0" style="display:none;visibility:hidden"></iframe>',
          }}
        />
        <AppProviders>
          <Navbar />
          {children}
          <Footer />
        </AppProviders>
        <SpeedInsights />
      </body>
    </html>
  );
}
