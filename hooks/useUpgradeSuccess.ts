"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function useUpgradeSuccess() {
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only run on client side after mount
    if (typeof window === "undefined") return;

    // Check if user just completed a successful upgrade
    const urlParams = new URLSearchParams(window.location.search);
    const upgradeSuccess = urlParams.get("upgrade");

    if (upgradeSuccess === "success") {
      // Show the welcome dialog
      setShowWelcomeDialog(true);

      // Clean up the URL parameter immediately to prevent persistence
      urlParams.delete("upgrade");
      const newSearch = urlParams.toString();
      const newUrl =
        window.location.pathname + (newSearch ? `?${newSearch}` : "");

      // Replace the URL without the upgrade parameter
      router.replace(newUrl, { scroll: false });
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
