"use client";
import { useState } from "react";
import { ChatMessage, ChatSession } from "@/lib/types/chatTypes";
import { useQueryClient } from "@tanstack/react-query";
import { useGetChatSession } from "@/hooks/chat/useGetChatSession";
import { useGetChatMessagesForSession } from "@/hooks/chat/useGetChatMessagesForSession";
import { useChat } from "@/hooks/chat/useChat";
import { useUserSubscription } from "@/hooks/user/useUserSubscription";
import ChatToolbar from "@/components/ChatToolbar";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";

interface ToolbarProps {
  chatSession: ChatSession;
  isLoading: boolean;
}

interface BaseChatPageContentProps {
  chatSessionId: string;
  chatSession: ChatSession;
  chatMessages: ChatMessage[];
  renderToolbar: (props: ToolbarProps) => React.ReactNode;
}
const BaseChatPageContent = ({
  chatSessionId,
  chatSession: initialChatSession,
  chatMessages: initialChatMessages,
  renderToolbar,
}: BaseChatPageContentProps) => {
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
  // get the user subscription
  const userSubscription = useUserSubscription();

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

  /** Prepare Toolbar Props */
  const toolbarProps: ToolbarProps = {
    chatSession: chatSession.data ?? initialChatSession,
    isLoading: chatSession.isLoading || chatMessages.isLoading,
  };
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex-shrink-0">{renderToolbar(toolbarProps)}</div>
      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ChatMessages
          messages={chatMessages.data ?? initialChatMessages}
          pendingUserMessage={pendingUserMessage}
        />
      </div>
      {/* Chat Input */}
      <div className="flex-shrink-0 p-4">
        <ChatInput
          onSend={handleSendChat}
          disabled={
            userSubscription.isLoading ||
            userSubscription.isError ||
            !userSubscription.isPro
          }
          tooltipMessage={
            !userSubscription.isPro
              ? "Pro subscription required to send message"
              : ""
          }
        />
      </div>
    </div>
  );
};
export default BaseChatPageContent;
