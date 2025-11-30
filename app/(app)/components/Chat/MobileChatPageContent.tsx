"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChatMessage, ChatSession } from "@/lib/types/chatTypes";
import BaseChatPageContent from "./BaseChatPageContent";
import { useMobileHeader } from "@/contexts/MobileHeaderContext";
import { useGetChatSession } from "@/hooks/chat/useGetChatSession";
import { useGetChatMessagesForSession } from "@/hooks/chat/useGetChatMessagesForSession";
import { useChat } from "@/hooks/chat/useChat";
import { useUserSubscription } from "@/hooks/user/useUserSubscription";
import { useUpdateChat } from "@/hooks/chat/useUpdateChat";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, SquarePenIcon, Trash2Icon } from "lucide-react";
import ScopeBadge from "@/components/ScopeBadge";
import OptionsMenu from "@/components/OptionsMenu";
import { toast } from "sonner";
import MobilePageTitle from "@/components/mobile/MobilePageTitle";
import InputDialog from "@/components/dialogs/InputDialog";

interface MobileChatPageContentProps {
  chatSessionId: string;
  chatSession: ChatSession;
  chatMessages: ChatMessage[];
}

const MobileChatPageContent = ({
  chatSessionId,
  chatSession: initialChatSession,
  chatMessages: initialChatMessages,
}: MobileChatPageContentProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setHeaderConfig, resetHeaderConfig } = useMobileHeader();
  const { isPro } = useUserSubscription();

  // State management
  const [pendingUserMessage, setPendingUserMessage] = useState<string>("");
  const [renameOpen, setRenameOpen] = useState(false);

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

  // Mutations
  const updateChatMutation = useUpdateChat();
  const sendChatMutation = useChat({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chat-session", chatSession.data?.id, "messages"],
      });
      setPendingUserMessage("");
    },
  });

  // Handlers
  const handleSaveTitle = (newTitle: string) => {
    if (chatSession.data) {
      updateChatMutation.mutate({
        sessionId: chatSession.data.id,
        action: "update_title",
        title: newTitle,
      });
    } else {
      toast.error("Unable to Update Title");
    }
  };

  const handleDeleteChatSession = () => {
    if (chatSession.data) {
      updateChatMutation.mutate({
        sessionId: chatSession.data.id,
        action: "delete",
      });
      router.push(`/folder/system_chats`);
    } else {
      toast.error("Unable to Delete");
    }
  };

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

  // Set mobile header configuration
  useEffect(() => {
    if (chatSession.data) {
      setHeaderConfig({
        leftContent: (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/folder/system_chats`)}
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            <MobilePageTitle
              title={chatSession.data.title || "Chat Session..."}
            />
            {chatSession.data.chat_scope && (
              <ScopeBadge chatScope={chatSession.data.chat_scope} />
            )}
          </>
        ),
        rightContent: (
          <OptionsMenu
            options={[
              {
                label: "Rename",
                icon: <SquarePenIcon className="h-4 w-4" />,
                onClick: () => setRenameOpen(true),
              },
              {
                label: "Delete",
                icon: <Trash2Icon className="h-4 w-4" />,
                onClick: handleDeleteChatSession,
              },
            ]}
          />
        ),
      });

      return () => {
        resetHeaderConfig();
      };
    }
  }, [chatSession.data, router, setHeaderConfig, resetHeaderConfig]);

  const isLoading = chatSession.isLoading || chatMessages.isLoading;

  return (
    <>
      <BaseChatPageContent
        chatSession={chatSession.data || initialChatSession}
        chatMessages={chatMessages.data || initialChatMessages}
        pendingUserMessage={pendingUserMessage}
        isLoading={isLoading}
        isPro={isPro}
        onSendChat={handleSendChat}
      />
      {/* Rename Dialog */}
      <InputDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        title="Rename This Chat"
        placeholder="Chat Title"
        confirmText="Rename"
        confirmLoadingText="Renaming..."
        onConfirm={(inputValue) => handleSaveTitle(inputValue)}
        isLoading={updateChatMutation.isPending}
        validate={(value) => value.trim().length > 0}
      />
    </>
  );
};

export default MobileChatPageContent;
