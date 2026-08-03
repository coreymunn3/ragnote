"use client";

import { useGetStorageUsage } from "@/hooks/file/useGetStorageUsage";
import { Progress } from "@/components/ui/progress";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}

export function StorageUsageIndicator() {
  const { data: usage, isLoading } = useGetStorageUsage();

  if (isLoading || !usage) return null;

  const percentage = Math.min(usage.percentage, 100);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Storage</span>
        <span>
          {formatBytes(usage.used)} / {formatBytes(usage.total)}
        </span>
      </div>
      <Progress value={percentage} className="h-1.5" />
      {percentage >= 90 && (
        <p className="text-xs text-destructive">
          Storage almost full. Delete unused files to free up space.
        </p>
      )}
    </div>
  );
}
