"use client";

import MobileLayout from "./layouts/mobile/layout";
import WebLayout from "./layouts/web/layout";
import ResponsiveLayout from "../../../components/ResponsiveLayout";
import WelcomeToProDialog from "../../../components/dialogs/WelcomeToProDialog";
import { useUpgradeSuccess } from "../../../hooks/useUpgradeSuccess";
import { MobileHeaderProvider } from "@/contexts/MobileHeaderContext";
import OfflineModeBanner from "@/components/OfflineModeBanner";

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { showWelcomeDialog, closeWelcomeDialog } = useUpgradeSuccess();

  return (
    <div>
      <OfflineModeBanner />
      <MobileHeaderProvider>
        <ResponsiveLayout MobileLayout={MobileLayout} WebLayout={WebLayout}>
          {children}
        </ResponsiveLayout>

        {/* Welcome to Pro dialog for successful upgrades */}
        <WelcomeToProDialog
          open={showWelcomeDialog}
          onOpenChange={closeWelcomeDialog}
        />
      </MobileHeaderProvider>
    </div>
  );
}
