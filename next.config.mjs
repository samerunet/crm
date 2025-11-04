/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; frame-src https://js.stripe.com https://hooks.stripe.com; connect-src 'self' https://api.stripe.com https://m.stripe.network; img-src 'self' https://*.stripe.com data:; style-src 'self' 'unsafe-inline';",
        },
      ],
    },
  ],
}
export default nextConfig
