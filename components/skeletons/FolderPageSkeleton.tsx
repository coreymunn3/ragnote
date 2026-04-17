import ResponsivePage from "@/components/ResponsivePage";
import MobileFolderPageSkeleton from "./mobile/MobileFolderPageSkeleton";
import WebFolderPageSkeleton from "./web/WebFolderPageSkeleton";

const FolderPageSkeleton = () => {
  return (
    <ResponsivePage
      mobileView={<MobileFolderPageSkeleton />}
      webView={<WebFolderPageSkeleton />}
    />
  );
};

export default FolderPageSkeleton;
