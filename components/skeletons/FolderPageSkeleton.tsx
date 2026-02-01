import ResponsivePage from "@/components/ResponsivePage";
import MobileFolderPageSkeleton from "./MobileFolderPageSkeleton";
import WebFolderPageSkeleton from "./WebFolderPageSkeleton";

const FolderPageSkeleton = () => {
  return (
    <ResponsivePage
      mobileView={<MobileFolderPageSkeleton />}
      webView={<WebFolderPageSkeleton />}
    />
  );
};

export default FolderPageSkeleton;
