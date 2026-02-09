// app/sw.ts
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkFirst } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

const CACHE_VERSION = "v1";

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: new NetworkFirst({
        cacheName: `api-cache-${CACHE_VERSION}`,
        networkTimeoutSeconds: 3,
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              if (response && response.status === 200) {
                const newHeaders = new Headers(response.headers);
                // Strip problematic headers that prevent caching
                newHeaders.delete("cache-control");
                newHeaders.delete("pragma");
                // Add cache-friendly headers
                // 1 hour cache duration
                newHeaders.set("cache-control", "public, max-age=3600");

                return new Response(response.body, {
                  status: response.status,
                  statusText: response.statusText,
                  headers: newHeaders,
                });
              }
              return response;
            },
          },
        ],
      }),
    },
    ...defaultCache,
  ],
});

serwist.addEventListeners();
