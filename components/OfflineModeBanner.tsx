"use client";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { WifiOff, Wifi, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function OfflineModeBanner() {
  const isOnline = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setIsDismissed(false); // Reset dismissal when going offline
    } else if (wasOffline) {
      // Just came back online
      setShowReconnected(true);
      setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
    }
  }, [isOnline, wasOffline]);

  return (
    <div className="hidden md:block">
      <AnimatePresence>
        {!isOnline && !isDismissed && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 dark:bg-amber-600 text-white px-4 py-3 shadow-lg"
          >
            <div className="flex items-center justify-center gap-2 max-w-7xl mx-auto relative">
              <div className="flex items-center justify-center gap-2">
                <WifiOff className="w-5 h-5" />
                <span className="font-medium">
                  You're offline - Viewing cached content (read-only mode)
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDismissed(true)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 hover:text-white h-8 w-8"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Dismiss</span>
              </Button>
            </div>
          </motion.div>
        )}

        {showReconnected && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-green-500 dark:bg-green-600 text-white px-4 py-3 shadow-lg"
          >
            <div className="flex items-center justify-center gap-2 max-w-7xl mx-auto">
              <Wifi className="w-5 h-5" />
              <span className="font-medium">
                Back online! You can now create and edit notes.
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
