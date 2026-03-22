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
import { SquarePenIcon, Trash2Icon } from "lucide-react";
import ScopeBadge from "@/components/ScopeBadge";
import OptionsMenu from "@/components/OptionsMenu";
import { toast } from "sonner";
import MobilePageTitle from "@/components/mobile/MobilePageTitle";
import InputDialog from "@/components/dialogs/InputDialog";
import MobileBackButton from "@/components/mobile/MobileBackButton";
import MobileChatPageSkeleton from "@/components/skeletons/MobileChatPageSkeleton";

interface MobileChatPageContentProps {
  chatSessionId: string;
}

const MobileChatPageContent = ({
  chatSessionId,
}: MobileChatPageContentProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setHeaderConfig, resetHeaderConfig } = useMobileHeader();
  const { isPro } = useUserSubscription();

  // State management
  const [pendingUserMessage, setPendingUserMessage] = useState<string>("");
  const [renameOpen, setRenameOpen] = useState(false);

  // Fetch chat session client-side
  const chatSession = useGetChatSession(chatSessionId);

  // Fetch chat messages client-side
  const chatMessages = useGetChatMessagesForSession(chatSessionId);

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
      router.push(`/chats`);
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
            <MobileBackButton onClick={() => router.push(`/chats`)} />
            <MobilePageTitle
              title={chatSession.data.title || "Chat Session..."}
            />
            {chatSession.data.chat_scope && (
              <ScopeBadge chatScope={chatSession.data.chat_scope.scope} />
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

  if (isLoading && !chatSession.data) {
    return <MobileChatPageSkeleton />;
  }

  // If we have no session data (error or offline uncached), show skeleton
  if (!chatSession.data) {
    return <MobileChatPageSkeleton />;
  }

  return (
    <>
      <BaseChatPageContent
        chatSession={chatSession.data}
        chatMessages={chatMessages.data || []}
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
        initialValue={chatSession.data.title!}
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
