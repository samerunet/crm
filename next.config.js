const path = require('path');

/** @type {import('next').NextConfig} */
const keywordPhrases = [
  "San Diego Fari Makeup",
  "San Diego Fariia Makeup",
  "San Diego Fari Makeup Artistry",
  "San Diego Fari Makeup Studio",
  "San Diego makeup artist",
  "San Diego bridal makeup",
  "San Diego wedding makeup artist",
  "San Diego makeup and hair",
  "San Diego soft glam makeup artist",
  "San Diego natural makeup artist",
  "San Diego full glam makeup artist",
  "San Diego luxury bridal makeup",
  "San Diego airbrush makeup artist",
  "San Diego HD makeup artist",
  "San Diego editorial makeup artist",
  "San Diego mobile makeup artist",
  "San Diego on-site makeup artist",
  "San Diego bridal makeup trial",
  "San Diego bridal party makeup",
  "San Diego wedding makeup packages",
  "San Diego bridal makeup packages",
  "San Diego wedding makeup pricing",
  "San Diego bridal makeup cost",
  "San Diego affordable bridal makeup",
  "San Diego best makeup artist",
  "San Diego top rated makeup artist",
  "San Diego last minute makeup artist",
  "San Diego same day makeup artist",
  "San Diego makeup artist near me",
  "San Diego engagement photos makeup",
  "San Diego photoshoot makeup artist",
  "San Diego headshot makeup",
  "San Diego maternity photoshoot makeup",
  "San Diego brand photoshoot makeup",
  "San Diego prom makeup artist",
  "San Diego quinceañera makeup artist",
  "San Diego makeup lessons",
  "San Diego South Asian bridal makeup",
  "San Diego Indian bridal makeup",
  "San Diego Pakistani bridal makeup",
  "San Diego Persian bridal makeup",
  "San Diego Afghan bridal makeup",
  "San Diego Arabic bridal makeup",
  "San Diego Armenian bridal makeup",
  "San Diego hijab-friendly makeup artist",
  "San Diego La Jolla makeup artist",
  "San Diego Del Mar makeup artist",
  "San Diego Coronado makeup artist",
  "San Diego Chula Vista makeup artist",
  "San Diego Carlsbad makeup artist",
  "San Diego Poway makeup artist",
  "San Diego Rancho Bernardo makeup artist",
  "San Diego Encinitas makeup artist",
  "San Diego Oceanside makeup artist",
  "San Diego Gaslamp wedding makeup",
  "San Diego Balboa Park wedding makeup",
  "San Diego beach wedding makeup",
  "San Diego coastal wedding makeup",
  "San Diego downtown wedding makeup",
  "San Diego luxury wedding makeup",
  "San Diego maquillista",
  "San Diego maquillista de novias",
  "San Diego maquillaje para bodas",
  "San Diego визажист",
  "San Diego визажист на свадьбу",
  "San Diego آرایشگر عروس",
];

const existingPaths = new Set([
  '/',
  '/about',
  '/services',
  '/portfolio',
  '/reviews',
  '/faq',
  '/guides',
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/forgot',
  '/auth/reset',
  '/admin',
  '/dashboard',
  '/dashboard1',
  '/login',
]);

const slugify = (value) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\u0400-\u04FF\u0600-\u06FF\u0E00-\u0E7F\u3040-\u30FF\u4E00-\u9FFF\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

const keywordRedirects = Array.from(
  new Set(
    keywordPhrases
      .map((phrase) => slugify(phrase))
      .filter((slug) => slug.length > 0 && !existingPaths.has(`/${slug}`)),
  ),
).map((slug) => ({
  source: `/${slug}`,
  destination: '/',
  permanent: true,
}));

const nextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [],
  },
  allowedDevOrigins: ['http://localhost:3000', 'http://100.64.0.246:3000'],
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [65, 75],
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2,
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  async redirects() {
    return keywordRedirects;
  },
};

module.exports = nextConfig;
