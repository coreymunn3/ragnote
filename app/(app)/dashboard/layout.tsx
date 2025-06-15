import WebDashboardLayout from "../components/layouts/web/dashboard/layout";
import MobileDashboardLayout from "../components/layouts/mobile/dashboard/layout";
import ResponsiveLayout from "../../../components/ResponsiveLayout";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ResponsiveLayout
      MobileLayout={MobileDashboardLayout}
      WebLayout={WebDashboardLayout}
    >
      {children}
    </ResponsiveLayout>
  );
};
export default DashboardLayout;
