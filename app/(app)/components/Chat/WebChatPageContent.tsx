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
import ChatPageSkeleton from "@/components/skeletons/ChatPageSkeleton";

interface WebChatPageContentProps {
  chatSessionId: string;
  initialChatSession: ChatSession | null;
  initialChatMessages: ChatMessage[];
}

const WebChatPageContent = ({
  chatSessionId,
  initialChatSession,
  initialChatMessages,
}: WebChatPageContentProps) => {
  const queryClient = useQueryClient();
  const { isPro } = useUserSubscription();

  // State management
  const [pendingUserMessage, setPendingUserMessage] = useState<string>("");

  // Re-fetch chat session
  const chatSession = useGetChatSession(chatSessionId, {
    placeholderData: initialChatSession || undefined,
    // Removed staleTime: 0 and refetchOnMount: true to use global defaults
  });

  // Re-fetch chat messages
  const chatMessages = useGetChatMessagesForSession(chatSessionId, {
    placeholderData: initialChatMessages,
    // Removed staleTime: 0 and refetchOnMount: true to use global defaults
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

  if (isLoading && !chatSession.data) {
    return <ChatPageSkeleton />;
  }

  // If we have no session data (error or offline uncached), show skeleton
  if (!chatSession.data) {
    return <ChatPageSkeleton />;
  }

  return (
    <BaseChatPageContent
      chatSession={chatSession.data}
      chatMessages={chatMessages.data || []}
      pendingUserMessage={pendingUserMessage}
      isLoading={isLoading}
      isPro={isPro}
      onSendChat={handleSendChat}
      renderToolbar={(props) => <ChatToolbar {...props} />}
    />
  );
};
export default WebChatPageContent;
