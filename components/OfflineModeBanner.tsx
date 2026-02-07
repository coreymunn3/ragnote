"use client";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { WifiOff, Wifi } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function OfflineModeBanner() {
  const isOnline = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
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
    <>
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-amber-500 dark:bg-amber-600 text-white px-4 py-3 shadow-lg"
          >
            <div className="flex items-center justify-center gap-2 max-w-7xl mx-auto">
              <WifiOff className="w-5 h-5" />
              <span className="font-medium">
                You're offline - Viewing cached content (read-only mode)
              </span>
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
    </>
  );
}
