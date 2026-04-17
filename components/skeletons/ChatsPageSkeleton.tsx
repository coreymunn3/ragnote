import ResponsivePage from "@/components/ResponsivePage";
import MobileChatsListSkeleton from "./mobile/MobileChatsListSkeleton";
import WebChatsListSkeleton from "./web/WebChatsListSkeleton";

const ChatsPageSkeleton = () => {
  return (
    <ResponsivePage
      mobileView={<MobileChatsListSkeleton />}
      webView={<WebChatsListSkeleton />}
    />
  );
};

export default ChatsPageSkeleton;
