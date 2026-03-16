import WebRecentlyDeletedContent from "../components/RecentlyDeleted/WebRecentlyDeletedContent";
import MobileRecentlyDeletedContent from "../components/RecentlyDeleted/MobileRecentlyDeletedContent";
import ResponsivePage from "@/components/ResponsivePage";

export default function RecentlyDeletedPage() {
  // Render each view component - data fetching now happens client-side
  const mobileView = <MobileRecentlyDeletedContent />;
  const webView = <WebRecentlyDeletedContent />;

  return <ResponsivePage mobileView={mobileView} webView={webView} />;
}
