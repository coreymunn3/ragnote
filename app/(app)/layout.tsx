"use client";

import MobileLayout from "./components/layouts/mobile/layout";
import WebLayout from "./components/layouts/web/layout";
import ResponsiveLayout from "../../components/ResponsiveLayout";
import WelcomeToProDialog from "../../components/dialogs/WelcomeToProDialog";
import { useUpgradeSuccess } from "../../hooks/useUpgradeSuccess";
import { MobileHeaderProvider } from "@/contexts/MobileHeaderContext";

export default function LayoutSwitch({
  children,
}: {
  children: React.ReactNode;
}) {
  const { showWelcomeDialog, closeWelcomeDialog } = useUpgradeSuccess();

  return (
    <div>
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
