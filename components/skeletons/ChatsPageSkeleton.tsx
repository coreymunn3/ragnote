import ResponsivePage from "@/components/ResponsivePage";
import MobileChatsListSkeleton from "./MobileChatsListSkeleton";
import WebChatsListSkeleton from "./WebChatsListSkeleton";

const ChatsPageSkeleton = () => {
  return (
    <ResponsivePage
      mobileView={<MobileChatsListSkeleton />}
      webView={<WebChatsListSkeleton />}
    />
  );
};

export default ChatsPageSkeleton;
