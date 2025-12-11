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

  return (
    <div>
      <AnimatedTypography variant="h1">{`Welcome!`}</AnimatedTypography>
      <div className="flex flex-col space-y-4">
        {/* global chat input */}
        <AnimatedListItem index={0} animation="fadeIn">
          <IntegratedSearch />
        </AnimatedListItem>
        {/* Pinned Notes */}
        <AnimatedListItem index={1} animation="fadeIn">
          <div>
            <WidgetList
              items={userNotes.data?.filter((note) => note.is_pinned) || []}
              renderItem={(note) => (
                <NoteWidget note={note} pinned={note.is_pinned} />
              )}
              title={"Pinned Notes"}
              icon={<PinIcon className="h-6 w-6 text-muted-foreground" />}
              delay={1}
            />
          </div>
        </AnimatedListItem>
        {/* Recent Notes */}
        <AnimatedListItem index={2} animation="fadeIn">
          <div>
            <WidgetList
              items={
                userNotes.data
                  ?.filter((note) => !note.is_pinned)
                  .sort(
                    (a, b) =>
                      new Date(b.current_version.updated_at).getTime() -
                      new Date(a.current_version.updated_at).getTime()
                  ) || []
              }
              renderItem={(note) => <NoteWidget note={note} />}
              title={"Recent Notes"}
              icon={<FileIcon className="h-6 w-6 text-muted-foreground" />}
              delay={2}
            />
          </div>
        </AnimatedListItem>
        {/* Recent Conversations */}
        <AnimatedListItem index={3} animation="fadeIn">
          <div>
            <WidgetList
              items={
                // sort the chat sessions by last updated time, and only show the first 10
                userChatSessions.data
                  ?.sort(
                    (a, b) =>
                      new Date(b.updated_at).getTime() -
                      new Date(a.updated_at).getTime()
                  )
                  .slice(0, 10) || []
              }
              renderItem={(conversation) => (
                <ChatWidget chatSession={conversation} />
              )}
              title={"Recent Chats"}
              icon={
                <MessageSquareIcon className="h-6 w-6 text-muted-foreground" />
              }
              delay={3}
            />
          </div>
        </AnimatedListItem>
      </div>
    </div>
  );
};
export default WebDashboardContent;
