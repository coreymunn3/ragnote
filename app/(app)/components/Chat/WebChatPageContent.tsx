"use client";

import { useState } from "react";
import { ChatMessage, ChatSession } from "@/lib/types/chatTypes";
import BaseChatPageContent from "./BaseChatPageContent";
import ChatToolbar from "@/components/ChatToolbar";
import { useGetChatSession } from "@/hooks/chat/useGetChatSession";
import { useGetChatMessagesForSession } from "@/hooks/chat/useGetChatMessagesForSession";
import { useChat } from "@/hooks/chat/useChat";
import { useUserSubscription } from "@/hooks/user/useUserSubscription";
import { useQueryClient } from "@tanstack/react-query";

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
  const { isPro } = useUserSubscription();

  // State management
  const [pendingUserMessage, setPendingUserMessage] = useState<string>("");

  // Re-fetch chat session
  const chatSession = useGetChatSession(chatSessionId, {
    initialData: initialChatSession,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Re-fetch chat messages
  const chatMessages = useGetChatMessagesForSession(chatSessionId, {
    initialData: initialChatMessages,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Mutation to send chat
  const sendChatMutation = useChat({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chat-session", chatSession.data?.id, "messages"],
      });
      setPendingUserMessage("");
    },
  });

  // Handler
  const handleSendChat = (message: string) => {
    setPendingUserMessage(message);
    if (chatSession.isSuccess && chatSession.data.chat_scope) {
      sendChatMutation.mutate({
        scope: chatSession.data?.chat_scope.scope,
        scopeId: chatSession.data?.chat_scope.scopeId || undefined,
        message,
        sessionId: chatSession.data?.id,
      });
    }
  };

  const isLoading = chatSession.isLoading || chatMessages.isLoading;

  return (
    <BaseChatPageContent
      chatSession={chatSession.data || initialChatSession}
      chatMessages={chatMessages.data || initialChatMessages}
      pendingUserMessage={pendingUserMessage}
      isLoading={isLoading}
      isPro={isPro}
      onSendChat={handleSendChat}
      renderToolbar={(props) => <ChatToolbar {...props} />}
    />
  );
};
export default WebChatPageContent;
