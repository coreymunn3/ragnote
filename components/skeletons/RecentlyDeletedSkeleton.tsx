import ResponsivePage from "@/components/ResponsivePage";
import MobileRecentlyDeletedSkeleton from "./MobileRecentlyDeletedSkeleton";
import WebRecentlyDeletedSkeleton from "./WebRecentlyDeletedSkeleton";

const RecentlyDeletedSkeleton = () => {
  return (
    <ResponsivePage
      mobileView={<MobileRecentlyDeletedSkeleton />}
      webView={<WebRecentlyDeletedSkeleton />}
    />
  );
};

export default RecentlyDeletedSkeleton;
