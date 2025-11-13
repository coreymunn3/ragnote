"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function useUpgradeSuccess() {
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user just completed a successful upgrade
    const upgradeSuccess = searchParams.get("upgrade");

    if (upgradeSuccess === "success") {
      // Show the welcome dialog
      setShowWelcomeDialog(true);

      // Clean up the URL parameter immediately to prevent persistence
      const url = new URL(window.location.href);
      url.searchParams.delete("upgrade");

      // Replace the URL without the upgrade parameter
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [searchParams, router]);

  const closeWelcomeDialog = () => {
    setShowWelcomeDialog(false);
  };

  return {
    showWelcomeDialog,
    closeWelcomeDialog,
  };
}
