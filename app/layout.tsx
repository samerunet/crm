import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AppProviders from '@/components/ui/app-providers';
import Navbar from '@/components/ui/navbar';
import Footer from '@/components/ui/footer';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'] });
const CANONICAL = new URL('https://farimakeup.com');

export const metadata: Metadata = {
  metadataBase: CANONICAL,
  title: {
    default: 'Fari Makeup — Bridal & Luxury Soft Glam in San Diego, OC & LA',
    template: '%s | Fari Makeup',
  },
  description:
    'Bridal makeup and modern soft glam across San Diego, Orange County, and Los Angeles. Luxury skin prep, long-lasting looks, on-location service, and a calm, professional experience.',
  alternates: { canonical: '/' },
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
    url: CANONICAL.toString(),
    siteName: 'Fari Makeup',
    title: 'Fari Makeup — Bridal & Luxury Soft Glam',
    description:
      'Timeless bridal looks and soft glam. Serving San Diego, OC, and LA. On-location services, trials, and destination weddings.',
    images: [
      {
        url: '/og.jpg',
        width: 1200,
        height: 630,
        alt: 'Fari Makeup — Bridal & Luxury Soft Glam',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fari Makeup — Bridal & Luxury Soft Glam',
    description:
      'Bridal makeup and soft glam in San Diego, OC & LA. Luxury skin prep, long-lasting looks, on-location service.',
    images: ['/og.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  manifest: '/manifest.webmanifest',
  category: 'beauty',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="fari-light">
      <body className={inter.className}>
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
