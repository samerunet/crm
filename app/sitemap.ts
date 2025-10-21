import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://farimakeup.com';
  const now = new Date().toISOString();
  const paths = ['', '/services', '/portfolio', '/faq', '/about', '/courses', '/auth/sign-in'];

  return paths.map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: p === '' ? 'weekly' : 'monthly',
    priority: p === '' ? 1 : 0.6,
  }));
}
