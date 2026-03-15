"use client";

import {
  CloudOffIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  Loader2Icon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type SaveStatusType = "idle" | "unsaved" | "saving" | "saved" | "error";

interface SaveStatusProps {
  status: SaveStatusType;
  className?: string;
}

const SaveStatus = ({ status, className }: SaveStatusProps) => {
  if (status === "idle") {
    return null; // Don't show anything in idle state
  }

  const statusConfig = {
    unsaved: {
      icon: <CloudOffIcon className="h-3.5 w-3.5" />,
      textColor: "text-amber-600 dark:text-amber-500",
      iconColor: "text-amber-600 dark:text-amber-500",
    },
    saving: {
      icon: <Loader2Icon className="h-3.5 w-3.5 animate-spin" />,
      textColor: "text-muted-foreground",
      iconColor: "text-muted-foreground",
    },
    saved: {
      icon: <CheckCircle2Icon className="h-3.5 w-3.5" />,
      textColor: "text-green-600 dark:text-green-500",
      iconColor: "text-green-600 dark:text-green-500",
    },
    error: {
      icon: <AlertCircleIcon className="h-3.5 w-3.5" />,
      textColor: "text-destructive",
      iconColor: "text-destructive",
    },
  };

  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className={cn("flex items-center gap-1", config.iconColor)}>
        {config.icon}
      </div>
    </div>
  );
};

export default SaveStatus;
