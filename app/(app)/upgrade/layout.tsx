import ResponsiveLayout from "@/components/ResponsiveLayout";
import WebUpgradeLayout from "../components/layouts/web/upgrade/layout";
import MobileUpgradeLayout from "../components/layouts/mobile/upgrade/layout";

const UpgradePageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ResponsiveLayout
      MobileLayout={MobileUpgradeLayout}
      WebLayout={WebUpgradeLayout}
    >
      {children}
    </ResponsiveLayout>
  );
};

export default UpgradePageLayout;
