import React from 'react';
import type { Metadata } from 'next';
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
  'Bridal makeup and modern soft glam across San Diego, Orange County, and Los Angeles. Luxury skin prep, long-lasting looks, on-location service, and a calm, professional experience.';

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: SITE_TITLE,
    template: '%s | Fari Makeup',
  },
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
  manifest: '/manifest.webmanifest',
  category: 'beauty',
};

export const icons = {
  icon: [
    { url: '/favicon.ico', sizes: 'any' },
    { url: '/favicon.svg', type: 'image/svg+xml' },
  ],
  apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="fari-light">
      <body className={inter.className}>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-54ESDKQQKV"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-54ESDKQQKV');
          `}
        </Script>
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
