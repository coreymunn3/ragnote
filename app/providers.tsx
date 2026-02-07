"use client";

import type { ThemeProviderProps } from "next-themes";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import {
  isServer,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Cache data for 24 hours
        gcTime: 24 * 60 * 60 * 1000,
        // Consider data stale after 5 minutes
        staleTime: 5 * 60 * 1000,
        // Retry failed queries when back online
        retry: (failureCount, error) => {
          if (typeof navigator !== "undefined" && !navigator.onLine)
            return false;
          return failureCount < 3;
        },
        // Use cache when offline
        networkMode: "offlineFirst",
      },
      mutations: {
        // Don't retry mutations when offline
        retry: false,
        networkMode: "online",
      },
    },
  });
}
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <ClerkProvider>
        <NextThemesProvider {...themeProps}>{children}</NextThemesProvider>
      </ClerkProvider>
      {/* react query dev tools */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
