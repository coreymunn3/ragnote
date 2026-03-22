"use client";

import WidgetGrid from "@/components/web/WidgetGrid";
import NoteWidget from "@/components/web/NoteWidget";
import ChatWidget from "@/components/web/ChatWidget";
import { FileIcon, MessageSquareIcon, PinIcon } from "lucide-react";
import { AnimatedListItem, AnimatedTypography } from "@/components/animations";
import { useGetNotes } from "@/hooks/note/useGetNotes";
import { useGetChatSessionsForUser } from "@/hooks/chat/useGetChatSessionsForUser";
import CommandBar from "@/components/commandbar/CommandBar";
import WebDashboardSkeleton from "@/components/skeletons/WebDashboardSkeleton";

const WebDashboardContent = () => {
  // Fetch the user's notes client-side
  const userNotes = useGetNotes();
  // Fetch the user's chat sessions client-side
  const userChatSessions = useGetChatSessionsForUser();

  // Show skeleton while loading
  if (userNotes.isLoading || userChatSessions.isLoading) {
    return <WebDashboardSkeleton />;
  }

  // Separate pinned and unpinned notes
  const pinnedNotes = userNotes.data?.filter((note) => note.is_pinned) || [];
  const recentNotes =
    userNotes.data
      ?.filter((note) => !note.is_pinned)
      // sort recent notes by last updated time
      .sort(
        (a, b) =>
          new Date(b.current_version.updated_at).getTime() -
          new Date(a.current_version.updated_at).getTime(),
      ) || [];

  // Sort chat sessions by last updated time
  const recentChats =
    userChatSessions.data?.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    ) || [];

  return (
    <div>
      <AnimatedTypography variant="h1">{`Welcome!`}</AnimatedTypography>
      <div className="flex flex-col space-y-8">
        {/* global chat input */}
        <AnimatedListItem index={0} animation="fadeIn">
          <CommandBar scope="global" />
        </AnimatedListItem>

        {/* Pinned Notes - only show if user has pinned notes */}
        {
          <AnimatedListItem index={1} animation="fadeIn">
            <WidgetGrid
              items={pinnedNotes}
              renderItem={(note) => <NoteWidget note={note} />}
              title="Pinned Notes"
              icon={<PinIcon className="h-6 w-6 text-muted-foreground" />}
              emptyContentMessage="No pinned notes yet. Any pinned notes will appear here."
              delay={1}
            />
          </AnimatedListItem>
        }

        {/* Recent Notes */}
        <AnimatedListItem index={2} animation="fadeIn">
          <WidgetGrid
            items={recentNotes}
            renderItem={(note) => <NoteWidget note={note} />}
            title="Recent Notes"
            icon={<FileIcon className="h-6 w-6 text-muted-foreground" />}
            emptyContentMessage="No notes yet. Create a note to get started."
            delay={2}
          />
        </AnimatedListItem>

        {/* Recent Chats */}
        <AnimatedListItem index={3} animation="fadeIn">
          <WidgetGrid
            items={recentChats}
            renderItem={(conversation) => (
              <ChatWidget chatSession={conversation} />
            )}
            title="Recent Chats"
            icon={
              <MessageSquareIcon className="h-6 w-6 text-muted-foreground" />
            }
            emptyContentMessage="No chats yet. Chat with one of your notes to get started."
            delay={3}
          />
        </AnimatedListItem>
      </div>
    </div>
  );
};
export default WebDashboardContent;
