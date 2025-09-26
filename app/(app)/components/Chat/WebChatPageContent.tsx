"use client";

import ChatToolbar from "@/components/ChatToolbar";
import { useGetChatMessagesForSession } from "@/hooks/chat/useGetChatMessagesForSession";
import { useGetChatSession } from "@/hooks/chat/useGetChatSession";
import { ChatMessage, ChatSession } from "@/lib/types/chatTypes";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";
import { useChat } from "@/hooks/chat/useChat";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

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
  const queryClient = useQueryClient();
  const [pendingUserMessage, setPendingUserMessage] = useState<string>("");

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
  // mutation to send a chat
  const sendChatMutation = useChat({
    onSuccess: (response) => {
      // Invalidate the chat conversation query
      queryClient.invalidateQueries({
        queryKey: ["chat-session", chatSession.data?.id, "messages"],
      });
      // clear pending message
      setPendingUserMessage("");
    },
  });

  /**
   * Called by the input, creates optimistic message and sends the chat via mutation
   * @param message the user's message
   */
  const handleSendChat = (message: string) => {
    // set the optimistic message
    setPendingUserMessage(message);
    // send the message
    if (chatSession.isSuccess && chatSession.data.chat_scope) {
      sendChatMutation.mutate({
        scope: chatSession.data?.chat_scope.scope,
        scopeId: chatSession.data?.chat_scope.scopeId || undefined,
        message,
        sessionId: chatSession.data?.id,
      });
    }
  };

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
        <ChatMessages
          messages={chatMessages.data ?? initialChatMessages}
          pendingUserMessage={pendingUserMessage}
        />
      </div>
      {/* Chat Input */}
      <div className="flex-shrink-0 p-4">
        <ChatInput onSend={handleSendChat} />
      </div>
    </div>
  );
};

export default WebChatPageContent;
