import WebDashboardContent from "../components/Dashboard/WebDashboardContent";
import MobileDashboardContent from "../components/Dashboard/MobileDashboardContent";
import ResponsivePage from "@/components/ResponsivePage";

export default function Dashboard() {
  // Render each view component - data fetching now happens client-side
  const mobileView = <MobileDashboardContent />;
  const webView = <WebDashboardContent />;

  return <ResponsivePage mobileView={mobileView} webView={webView} />;
}
