import type { NextConfig } from "next";

/**
 * NEXT.JS CONFIG (PATCHED FOR HOSTINGER NO-SSH)
 * ---------------------------------------------
 * - output: "standalone" → produces a self-contained .next/standalone/ folder
 *   that can be run with `node .next/standalone/server.js` without node_modules
 * - instrumentationHook: true → enables /instrumentation.ts auto-setup on boot
 */

const nextConfig: NextConfig = {
  output: "standalone",
  instrumentationHook: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
  // Allow Hostinger's internal port env var to take precedence
  experimental: {
    // Next.js 16 may not need this but doesn't hurt
  },
};

export default nextConfig;
