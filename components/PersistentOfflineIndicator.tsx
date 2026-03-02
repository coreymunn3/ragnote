"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";

export default function PersistentOfflineIndicator() {
  const isOnline = useOnlineStatus();

  // If online, don't render anything
  if (isOnline) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[999] bg-amber-200 text-amber-600 p-2 rounded-full shadow-lg border border-amber-300"
      aria-label="Offline Mode"
    >
      <WifiOff className="w-6 h-6" />
      <span className="sr-only">Offline</span>
    </div>
  );
}
