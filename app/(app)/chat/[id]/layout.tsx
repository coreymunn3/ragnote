import ResponsiveLayout from "@/components/ResponsiveLayout";
import WebChatLayout from "../../components/layouts/web/chat/layout";
import MobileChatLayout from "../../components/layouts/mobile/chat/layout";

const ChatPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ResponsiveLayout WebLayout={WebChatLayout} MobileLayout={MobileChatLayout}>
      {children}
    </ResponsiveLayout>
  );
};

export default ChatPageLayout;
