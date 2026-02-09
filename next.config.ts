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
    { url: "/dashboard", revision: REVISION },
    { url: "/chats", revision: REVISION },
    { url: "/recently-deleted", revision: REVISION },
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
};

export default withSerwist(nextConfig);
