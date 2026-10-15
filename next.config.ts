import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // The site (per language) and the dashboard have separate root layouts, so the
    // app-wide 404 for unmatched URLs lives in app/global-not-found.tsx.
    globalNotFound: true,
  },
};

export default nextConfig;
