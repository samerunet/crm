import { NextResponse } from 'next/server';

export function middleware() {
  const res = NextResponse.next();
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), geolocation=(), microphone=()');
  res.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' vercel-insights.com https://www.googletagmanager.com https://www.google-analytics.com https://google-analytics.com https://ssl.google-analytics.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://www.google-analytics.com https://google-analytics.com https://ssl.google-analytics.com",
      "font-src 'self' data:",
      "connect-src 'self' https://vitals.vercel-insights.com https://www.googletagmanager.com https://www.google-analytics.com https://google-analytics.com https://ssl.google-analytics.com https://analytics.google.com https://stats.g.doubleclick.net https://g.doubleclick.net",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  );
  return res;
}

export const config = { matcher: '/:path*' };
