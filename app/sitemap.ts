import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://crm-sable-iota.vercel.app';

  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/services`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/portfolio`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/reviews`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/faq`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/about`, changeFrequency: 'yearly', priority: 0.5 },
  ];
}
