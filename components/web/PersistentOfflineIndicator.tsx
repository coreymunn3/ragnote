"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { WifiOffIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function PersistentOfflineIndicator() {
  const isOnline = useOnlineStatus();

  return (
    <div className="h-10">
      {!isOnline && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-full border border-amber-500/20 cursor-help transition-all hover:bg-amber-500/20 flex items-center gap-2">
                <WifiOffIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Offline Mode</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>You are currently offline - viewing cached content</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
