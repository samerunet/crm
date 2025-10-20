import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  experimental: {
    // keep Turbopack dev defaults; empty object avoids legacy warnings
  },
  allowedDevOrigins: ["http://localhost:3000", "http://100.64.0.246:3000"],
  images: {
    unoptimized: isDev,
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 85, 90],
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true }, // TEMP while we fix TS
};

export default nextConfig;
