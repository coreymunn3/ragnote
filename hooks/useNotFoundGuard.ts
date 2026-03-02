"use client";

import { useMemo, useEffect } from "react";
import { notFound } from "next/navigation";
import { useOnlineStatus } from "./useOnlineStatus";

interface UseNotFoundGuardProps {
  data: any;
  isLoading: boolean;
}

/**
 * A hook to trigger Next.js notFound() when data is missing,
 * but only if the user is online. If offline, we assume the data
 * might be available later or is simply not cached.
 */
export function useNotFoundGuard({ data, isLoading }: UseNotFoundGuardProps) {
  const isOnline = useOnlineStatus();

  const shouldShowNotFound = useMemo(() => {
    // If we have data, we're good
    if (data) return false;
    // If we're still loading, wait
    if (isLoading) return false;
    // If we're online and have no data and finished loading, it's 404
    if (isOnline && !data && !isLoading) return true;

    // If offline and no data, we don't 404 because it might exist on server
    return false;
  }, [data, isLoading, isOnline]);

  if (shouldShowNotFound) {
    notFound();
  }

  return shouldShowNotFound;
}
