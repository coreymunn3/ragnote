"use client";

import WidgetList from "@/components/web/WidgetList";
import NoteWidget from "@/components/web/NoteWidget";
import ChatWidget from "@/components/web/ChatWidget";
import { FileIcon, MessageSquareIcon, PinIcon } from "lucide-react";
import { AnimatedListItem, AnimatedTypography } from "@/components/animations";
import { useGetNotes } from "@/hooks/note/useGetNotes";
import { Note } from "@/lib/types/noteTypes";
import { ChatSession } from "@/lib/types/chatTypes";
import { useGetChatSessionsForUser } from "@/hooks/chat/useGetChatSessionsForUser";
import IntegratedSearch from "@/components/search/IntegratedSearch";

interface WebDashboardContentProps {
  notes: Note[];
  chatSessions: ChatSession[];
}

const WebDashboardContent = ({
  notes,
  chatSessions,
}: WebDashboardContentProps) => {
  // re-fetch the user's notes
  const userNotes = useGetNotes({
    initialData: notes,
    staleTime: 0,
    refetchOnMount: true,
  });
  // re-fetch the user's chat sessions
  const userChatSessions = useGetChatSessionsForUser({
    initialData: chatSessions,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Separate pinned and unpinned notes
  const pinnedNotes = userNotes.data?.filter((note) => note.is_pinned) || [];
  const recentNotes =
    userNotes.data
      ?.filter((note) => !note.is_pinned)
      // sort recent notes by last updated time
      .sort(
        (a, b) =>
          new Date(b.current_version.updated_at).getTime() -
          new Date(a.current_version.updated_at).getTime()
      ) || [];

  // Sort chat sessions by last updated time
  const recentChats =
    userChatSessions.data?.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    ) || [];

  return (
    <div>
      <AnimatedTypography variant="h1">{`Welcome!`}</AnimatedTypography>
      <div className="flex flex-col space-y-8">
        {/* global chat input */}
        <AnimatedListItem index={0} animation="fadeIn">
          <IntegratedSearch />
        </AnimatedListItem>

        {/* Pinned Notes - only show if user has pinned notes */}
        {pinnedNotes.length > 0 && (
          <AnimatedListItem index={1} animation="fadeIn">
            <WidgetList
              items={pinnedNotes}
              renderItem={(note) => (
                <NoteWidget note={note} pinned={note.is_pinned} />
              )}
              title="Pinned Notes"
              icon={<PinIcon className="h-6 w-6 text-muted-foreground" />}
              displayMode="grid"
              initialItemLimit={2}
              showMoreIncrement={2}
              showMoreButton={true}
              delay={1}
            />
          </AnimatedListItem>
        )}

        {/* Recent Notes */}
        <AnimatedListItem index={2} animation="fadeIn">
          <WidgetList
            items={recentNotes}
            renderItem={(note) => <NoteWidget note={note} />}
            title="Recent Notes"
            icon={<FileIcon className="h-6 w-6 text-muted-foreground" />}
            displayMode="grid"
            initialItemLimit={4}
            showMoreIncrement={4}
            showMoreButton={true}
            delay={2}
          />
        </AnimatedListItem>

        {/* Recent Chats */}
        <AnimatedListItem index={3} animation="fadeIn">
          <WidgetList
            items={recentChats}
            renderItem={(conversation) => (
              <ChatWidget chatSession={conversation} />
            )}
            title="Recent Chats"
            icon={
              <MessageSquareIcon className="h-6 w-6 text-muted-foreground" />
            }
            displayMode="grid"
            initialItemLimit={4}
            showMoreIncrement={4}
            showMoreButton={true}
            delay={3}
          />
        </AnimatedListItem>
      </div>
    </div>
  );
};
export default WebDashboardContent;
