import 'react-big-calendar/lib/css/react-big-calendar.css';
import './globals.css';

import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/next';

import SeoJsonLd from '@/components/seo-jsonld';
import AppProviders from '@/components/ui/app-providers';
import Footer from '@/components/ui/footer';
import Navbar from '@/components/ui/navbar';

export const metadata: Metadata = {
  metadataBase: new URL('https://crm-sable-iota.vercel.app'),
  title: {
    default: 'Fari Makeup — Bridal & Luxury Makeup Artist',
    template: '%s | Fari Makeup',
  },
  description:
    'Bridal & luxury makeup artist in San Diego with on-location services across Orange County, Los Angeles & destination weddings.',
  robots: { index: true, follow: true, nocache: false },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Fari Makeup',
    url: 'https://crm-sable-iota.vercel.app/',
    title: 'Fari Makeup — Bridal & Luxury Makeup Artist',
    description:
      'Soft, camera-ready glam for weddings, editorials, and events across San Diego, OC, LA & destinations.',
    images: [{ url: '/og/hero.jpg', width: 1200, height: 630, alt: 'Luxury bridal makeup' }],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@fari_makeup',
    title: 'Fari Makeup — Bridal & Luxury Makeup Artist',
    description:
      'Soft, camera-ready glam for weddings, editorials, and events across San Diego, OC, LA & destinations.',
    images: ['/og/hero.jpg'],
  },
  icons: {
    icon: '/favicon.svg',
  },
  verification: {
    google: '-cwOr0RxS8EOx34LSK-TDrtz09nrsEPjC1vn05djVm8',
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

export { reportWebVitals } from '@/lib/vitals';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="fari-light" suppressHydrationWarning>
      <body>
        <AppProviders>
          <Navbar />
          {children}
          <Footer />
        </AppProviders>
        <SeoJsonLd />
        <SpeedInsights />
      </body>
    </html>
  );
}
