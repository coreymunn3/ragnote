"use client";

import { useGetChatMessagesForSession } from "@/hooks/chat/useGetChatMessagesForSession";
import { useGetChatSession } from "@/hooks/chat/useGetChatSession";
import { ChatMessage, ChatSession } from "@/lib/types/chatTypes";

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
      <p>Hello, Chat Page</p>
      <p>{chatSession.data?.title}</p>
      {/* Chat Toolbar (TO DO) */}
      {/* Chat Messages */}
      {/* Chat Input */}
    </div>
  );
};

export default WebChatPageContent;
