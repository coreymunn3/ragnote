import ResponsivePage from "@/components/ResponsivePage";
import MobileChatPageSkeleton from "./mobile/MobileChatPageSkeleton";
import WebChatPageSkeleton from "./WebChatPageSkeleton";

const ChatPageSkeleton = () => {
  return (
    <ResponsivePage
      mobileView={<MobileChatPageSkeleton />}
      webView={<WebChatPageSkeleton />}
    />
  );
};

export default ChatPageSkeleton;
