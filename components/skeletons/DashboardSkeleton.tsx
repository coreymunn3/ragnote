import ResponsivePage from "@/components/ResponsivePage";
import MobileDashboardSkeleton from "./mobile/MobileDashboardSkeleton";
import WebDashboardSkeleton from "./WebDashboardSkeleton";

const DashboardSkeleton = () => {
  return (
    <ResponsivePage
      mobileView={<MobileDashboardSkeleton />}
      webView={<WebDashboardSkeleton />}
    />
  );
};

export default DashboardSkeleton;
