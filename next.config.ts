import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // keep Turbopack dev defaults; empty object avoids legacy warnings
  },
  allowedDevOrigins: ["http://localhost:3000", "http://100.64.0.246:3000"],
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
    qualities: [65, 75],
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 2,
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true }, // TEMP while we fix TS
};

export default nextConfig;
