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
    <div className="flex flex-col h-screen">
      {/* Toolbar */}
      <div className="flex-shrink-0">
        <ChatToolbar
          chatSession={chatSession.data ?? initialChatSession}
          isLoading={chatSession.isLoading}
        />
      </div>
      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ChatMessages messages={chatMessages.data ?? initialChatMessages} />
      </div>
      {/* Chat Input */}
      <div className="flex-shrink-0 p-4">
        <ChatInput
          onSend={(message) => {
            // TODO: Implement send functionality
            console.log("Message sent:", message);
          }}
        />
      </div>
    </div>
  );
};

export default WebChatPageContent;
