"use client";
import { ChatMessage, ChatSession } from "@/lib/types/chatTypes";
import BaseChatPageContent from "./BaseChatPageContent";
import ChatToolbar from "@/components/ChatToolbar";

interface MobileChatPageContentProps {
  chatSessionId: string;
  chatSession: ChatSession;
  chatMessages: ChatMessage[];
}

const MobileChatPageContent = (pageProps: MobileChatPageContentProps) => {
  return (
    <BaseChatPageContent
      {...pageProps}
      renderToolbar={(props) => (
        <ChatToolbar {...props} includeLastActivity={false} />
      )}
    />
  );
};

export default MobileChatPageContent;
