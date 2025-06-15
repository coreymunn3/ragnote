import WebDashboardLayout from "../components/layouts/web/dashboard/layout";
import MobileDashboardLayout from "../components/layouts/mobile/dashboard/layout";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {/* render mobile layouts on small screens */}
      <div className="md:hidden">
        <MobileDashboardLayout>{children}</MobileDashboardLayout>
      </div>
      {/* render web layout on larger screens */}
      <div className="hidden md:block">
        <WebDashboardLayout>{children}</WebDashboardLayout>
      </div>
    </>
  );
};
export default DashboardLayout;
