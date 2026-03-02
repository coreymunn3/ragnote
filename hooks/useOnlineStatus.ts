"use client";
import { useState, useEffect } from "react";

export function useOnlineStatus() {
  // Initialize state with current navigator status if available
  const [isOnline, setIsOnline] = useState(() => {
    // Use the actual browser state immediately
    if (typeof window !== "undefined") return navigator.onLine;
    return true;
  });

  useEffect(() => {
    // Re-check on mount to sync with reality immediately
    setIsOnline(navigator.onLine);
    const sync = () => setIsOnline(navigator.onLine);
    // sync every time there's a change to the windows online/offline status
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  return isOnline;
}
