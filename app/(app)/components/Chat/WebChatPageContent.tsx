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
}

const WebChatPageContent = ({ chatSessionId }: WebChatPageContentProps) => {
  const queryClient = useQueryClient();
  const { isPro } = useUserSubscription();

  // State management
  const [pendingUserMessage, setPendingUserMessage] = useState<string>("");

  // Fetch chat session client-side
  const chatSession = useGetChatSession(chatSessionId);

  // Fetch chat messages client-side
  const chatMessages = useGetChatMessagesForSession(chatSessionId);

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
