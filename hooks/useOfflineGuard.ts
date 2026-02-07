"use client";
import { useOnlineStatus } from "./useOnlineStatus";
import { toast } from "sonner";

export function useOfflineGuard() {
  const isOnline = useOnlineStatus();

  const guardMutation = (callback: () => void) => {
    if (!isOnline) {
      toast.error("You're offline", {
        description: "This action requires an internet connection",
      });
      return;
    }
    callback();
  };

  return { isOnline, guardMutation };
}
