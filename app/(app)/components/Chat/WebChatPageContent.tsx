"use client";

import { ChatMessage, ChatSession } from "@/lib/types/chatTypes";
import BaseChatPageContent from "./BaseChatPageContent";
import ChatToolbar from "@/components/ChatToolbar";

interface WebChatPageContentProps {
  chatSessionId: string;
  chatSession: ChatSession;
  chatMessages: ChatMessage[];
}

const WebChatPageContent = (pageProps: WebChatPageContentProps) => {
  return (
    <BaseChatPageContent
      {...pageProps}
      renderToolbar={(props) => <ChatToolbar {...props} />}
    />
  );
};
export default WebChatPageContent;
