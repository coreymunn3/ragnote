"use client";

import WidgetGrid from "@/components/web/WidgetGrid";
import ChatWidget from "@/components/web/ChatWidget";
import { MessageSquareIcon } from "lucide-react";
import { AnimatedListItem, AnimatedTypography } from "@/components/animations";
import { ChatSession } from "@/lib/types/chatTypes";
import { useGetChatSessionsForUser } from "@/hooks/chat/useGetChatSessionsForUser";

const WebChatsContent = () => {
  // Fetch the user's chat sessions client-side
  const userChatSessions = useGetChatSessionsForUser();

  // Sort chat sessions by last updated time
  const sortedChats =
    userChatSessions.data?.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    ) || [];

  return (
    <div>
      <AnimatedTypography variant="h1">Chats</AnimatedTypography>
      <div className="flex flex-col space-y-8">
        {/* All Chats */}
        <AnimatedListItem index={0} animation="fadeIn">
          <WidgetGrid
            items={sortedChats}
            renderItem={(conversation) => (
              <ChatWidget chatSession={conversation} />
            )}
            title="All Chats"
            icon={
              <MessageSquareIcon className="h-6 w-6 text-muted-foreground" />
            }
            emptyContentMessage="No chats yet. Chat with one of your notes to get started."
            initialItemLimit={8}
            showMoreIncrement={8}
            showMoreButton={true}
            delay={0}
          />
        </AnimatedListItem>
      </div>
    </div>
  );
};
export default WebChatsContent;
