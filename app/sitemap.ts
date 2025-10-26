import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://farimakeup.com';
  const now = new Date().toISOString();
  const paths = [
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
  ];

  return paths.map((p, index) => ({
    url: `${base}${p === '/' ? '' : p}`,
    lastModified: now,
    changeFrequency: index === 0 ? 'weekly' : 'monthly',
    priority: index === 0 ? 1 : 0.5,
  }));
}
