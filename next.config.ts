import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const REVISION = Date.now().toString();

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  additionalPrecacheEntries: [
    { url: "/offline", revision: REVISION },
    { url: "/", revision: REVISION },
  ],
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    staleTimes: {
      // This tells the router cache to reuse previously fetched RSC payloads for 30 seconds, eliminating the server round-trip on repeat visits.
      // should help to ensure zero server-side-driven loading states when navigating pages
      dynamic: 30,
    },
  },
};

export default withSerwist(nextConfig);
