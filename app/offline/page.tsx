"use client";

import { WifiOff, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      {/* Visual background glow using secondary color */}
      <div className="relative mb-8">
        <div className="absolute inset-0 scale-150 bg-secondary/20 blur-3xl rounded-full" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-primary shadow-xl shadow-primary/20">
          <WifiOff className="h-12 w-12 text-primary-foreground" />
        </div>
      </div>

      <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
        Connection lost
      </h1>

      <p className="mb-10 max-w-sm text-muted-foreground">
        This page hasn not been cached for offline use yet. Don&apos;t worry—it
        will be available once you regain your connection.
      </p>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Button
          size="lg"
          className="px-8 gap-2 shadow-lg shadow-primary/20"
          onClick={() => {
            // Direct navigation is the most reliable way to
            // trigger a clean Service Worker cache hit while offline.
            window.location.href = "/dashboard";
          }}
        >
          <Home className="h-4 w-4" />
          Return Home
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={() => window.location.reload()}
          className="px-8 gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary"
        >
          <RefreshCw className="h-4 w-4" />
          Try Refresh
        </Button>
      </div>

      <div className="mt-16 flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-sm">
        <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
        Tip: Any page you visit while online is saved for later.
      </div>
    </div>
  );
}
