"use client";
import { useParams, useRouter } from "next/navigation";
import EditableField from "./EditableField";
import { ChatSession } from "@/lib/types/chatTypes";
import { Skeleton } from "./ui/skeleton";
import OptionsMenu from "./OptionsMenu";
import { Trash2Icon } from "lucide-react";
import { TypographyMuted } from "./ui/typography";
import { DateTime } from "luxon";
import { useUpdateChat } from "@/hooks/chat/useUpdateChat";
import { toast } from "sonner";
import ScopeBadge from "./ScopeBadge";
import { Button } from "./ui/button";

interface ChatToolbarProps {
  chatSession: ChatSession;
  isLoading: boolean;
  includeLastActivity?: boolean;
}

const ChatToolbar = ({
  chatSession,
  isLoading,
  includeLastActivity = true,
}: ChatToolbarProps) => {
  const { id } = useParams();
  const router = useRouter();
  const updateChatMutation = useUpdateChat();

  /**
   * Save the new chat title
   */
  const handleSaveTitle = (newTitle: string) => {
    if (chatSession) {
      updateChatMutation.mutate({
        sessionId: chatSession.id,
        action: "update_title",
        title: newTitle,
      });
    } else {
      toast.error("Unable to Update Title");
    }
  };

  /**
   * Soft delete a chat session
   */
  const handleDeleteChatSession = () => {
    if (chatSession) {
      updateChatMutation.mutate({
        sessionId: chatSession.id,
        action: "delete",
      });
      // route user back to the system_chats folder
      router.push(`/folder/system_chats`);
    } else {
      toast.error("Unable to Delete");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2">
      {/* left side - title and scope badge */}
      <div className="flex items-center space-x-2">
        <EditableField
          value={chatSession.title || "Chat Session..."}
          variant="bold"
          onSave={handleSaveTitle}
        />
        {chatSession.chat_scope && (
          <ScopeBadge chatScope={chatSession.chat_scope} />
        )}
      </div>
      {/* right side - last activity, controls */}
      <div className="flex items-center space-x-2">
        {includeLastActivity && (
          <TypographyMuted className="text-sm">
            {DateTime.fromISO(chatSession.updated_at).toRelative()}
          </TypographyMuted>
        )}

        <Button variant={"ghost"} onClick={handleDeleteChatSession}>
          <Trash2Icon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
export default ChatToolbar;
