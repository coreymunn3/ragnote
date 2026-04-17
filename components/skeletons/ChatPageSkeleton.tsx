import ResponsivePage from "@/components/ResponsivePage";
import MobileChatPageSkeleton from "./mobile/MobileChatPageSkeleton";
import WebChatPageSkeleton from "./web/WebChatPageSkeleton";

const ChatPageSkeleton = () => {
  return (
    <ResponsivePage
      mobileView={<MobileChatPageSkeleton />}
      webView={<WebChatPageSkeleton />}
    />
  );
};

export default ChatPageSkeleton;
