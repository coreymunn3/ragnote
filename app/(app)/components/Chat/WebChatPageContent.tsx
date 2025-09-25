"use client";

import ChatToolbar from "@/components/ChatToolbar";
import { useGetChatMessagesForSession } from "@/hooks/chat/useGetChatMessagesForSession";
import { useGetChatSession } from "@/hooks/chat/useGetChatSession";
import { ChatMessage, ChatSession } from "@/lib/types/chatTypes";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";

interface WebChatPageContentProps {
  chatSessionId: string;
  chatSession: ChatSession;
  chatMessages: ChatMessage[];
}

const WebChatPageContent = ({
  chatSessionId,
  chatSession: initialChatSession,
  chatMessages: initialChatMessages,
}: WebChatPageContentProps) => {
  // re-fetch chat session
  const chatSession = useGetChatSession(chatSessionId, {
    initialData: initialChatSession,
    staleTime: 0,
    refetchOnMount: true,
  });
  // re-fetch chat messages
  const chatMessages = useGetChatMessagesForSession(chatSessionId, {
    initialData: initialChatMessages,
    staleTime: 0,
    refetchOnMount: true,
  });
  return (
    <div>
      {/* Toolbar */}
      <ChatToolbar
        chatSession={chatSession.data ?? initialChatSession}
        isLoading={chatSession.isLoading}
      />
      {/* Chat Messages */}
      <ChatMessages messages={chatMessages.data ?? initialChatMessages} />
      {/* Chat Input */}
    </div>
  );
};

export default WebChatPageContent;
