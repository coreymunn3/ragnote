"use client";
import { useState, useEffect } from "react";

export function useOnlineStatus() {
  // Initialize from navigator.onLine instead of hardcoded true
  const [isOnline, setIsOnline] = useState(() => {
    // Check if we're in browser environment
    if (typeof window !== "undefined") {
      return navigator.onLine;
    }
    return true; // SSR fallback
  });

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
