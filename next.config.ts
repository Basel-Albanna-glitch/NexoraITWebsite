import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The starting content in git. On Vercel it's read until the first save to Redis, so ship it with every route.
  outputFileTracingIncludes: {
    "/**": ["./data/content.json", "./data/projects.json"],
  },
  experimental: {
    // The site (per language) and the dashboard have separate root layouts, so the
    // app-wide 404 for unmatched URLs lives in app/global-not-found.tsx.
    globalNotFound: true,
  },
};

export default nextConfig;
