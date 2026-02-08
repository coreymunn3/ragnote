"use client";

import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-background">
      <div className="bg-muted p-4 rounded-full mb-4">
        <WifiOff className="w-8 h-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold mb-2">You're Offline</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        It looks like you've lost your internet connection. Some features may
        not be available until you reconnect.
      </p>
      <Button onClick={() => window.location.reload()}>Try Again</Button>
    </div>
  );
}
