import ResponsivePage from "@/components/ResponsivePage";
import MobileChatPageContent from "../../components/Chat/MobileChatPageContent";
import WebChatPageContent from "../../components/Chat/WebChatPageContent";
import { use } from "react";

export default function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: chatSessionId } = use(params);

  // Render each view component - data fetching now happens client-side
  const mobileView = <MobileChatPageContent chatSessionId={chatSessionId} />;
  const webView = <WebChatPageContent chatSessionId={chatSessionId} />;

  return <ResponsivePage mobileView={mobileView} webView={webView} />;
}
