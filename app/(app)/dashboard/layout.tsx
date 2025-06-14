import WebDashboardLayout from "../(web_layout)/dashboard/layout";
import MobileDashboardLayout from "../(mobile_layout)/dashboard/layout";

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
