"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import WidgetList from "@/components/web/WidgetList";
import NoteWidget from "@/components/web/NoteWidget";
import ConversationWidget from "@/components/web/ConversationWidget";
import { Calendar1Icon, MessageSquareIcon, PinIcon } from "lucide-react";
import { AnimatedListItem, AnimatedTypography } from "@/components/animations";
import { useGetNotes } from "@/hooks/note/useGetNotes";
import { Note } from "@/lib/types/noteTypes";

interface WebDashboardContentProps {
  notes: Note[];
}

const WebDashboardContent = ({ notes }: WebDashboardContentProps) => {
  const userNotes = useGetNotes({
    initialData: notes,
    staleTime: 0,
    refetchOnMount: true,
  });

  const conversations = [
    {
      id: "1",
      title: "What can I ask about?",
      is_pinned: false,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date(),
      messages_count: 3,
    },
    {
      id: "2",
      title: "What is my wifi password?",
      is_pinned: false,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date(),
      messages_count: 8,
    },
  ];
  return (
    <div>
      <AnimatedTypography variant="h1">{`Welcome!`}</AnimatedTypography>
      <div className="flex flex-col space-y-12">
        {/* global chat input */}
        {/* TO DO */}
        <AnimatedListItem index={0} animation="fadeIn">
          <Card className="min-h-[200px]">
            <CardHeader>
              <CardTitle>Chat with your notes</CardTitle>
              <CardDescription>
                Here we will show an input to chat with all your notes
              </CardDescription>
            </CardHeader>
          </Card>
        </AnimatedListItem>
        {/* Pinned Notes */}
        <AnimatedListItem index={1} animation="fadeIn">
          <div>
            <WidgetList
              items={userNotes.data?.filter((note) => note.is_pinned) || []}
              renderItem={(note) => <NoteWidget note={note} pinned={false} />}
              title={"Pinned"}
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
                userNotes.data?.sort(
                  (a, b) =>
                    new Date(b.current_version.updated_at).getTime() -
                    new Date(a.current_version.updated_at).getTime()
                ) || []
              }
              renderItem={(note) => <NoteWidget note={note} />}
              title={"Recent"}
              icon={<Calendar1Icon className="h-6 w-6 text-muted-foreground" />}
              delay={2}
            />
          </div>
        </AnimatedListItem>
        {/* Recent Conversations */}
        <AnimatedListItem index={3} animation="fadeIn">
          <div>
            <WidgetList
              items={conversations}
              renderItem={(conversation) => (
                <ConversationWidget chatSession={conversation} />
              )}
              title={"Chats & Conversations"}
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
