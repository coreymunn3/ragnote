"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PersistentOfflineIndicator() {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="fixed bottom-4 right-4 z-40 bg-amber-200 text-amber-600 p-2 rounded-full shadow-lg"
        >
          <WifiOff className="w-6 h-6" />
          <span className="sr-only">Offline</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
