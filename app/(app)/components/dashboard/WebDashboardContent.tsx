import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import WidgetList from "@/components/web/WidgetList";
import NoteWidget from "@/components/web/NoteWidget";
import ConversationWidget from "@/components/web/ConversationWidget";
import { currentUser } from "@clerk/nextjs/server";
import { Calendar1Icon, MessageSquareIcon, PinIcon } from "lucide-react";
import { AnimatedListItem, AnimatedTypography } from "@/components/animations";
import { STAGGER_DELAY } from "@/lib/animations";

const WebDashboardContent = async () => {
  const user = await currentUser();

  // TO DO - get all notes in the folder ordered by most recent
  // ...and eventually, all files as a separate folder
  const notes = [
    {
      id: "1",
      title: "Trips I want to take in 2025",
      current_version: {
        version_number: 7,
        is_published: true,
        published_at: new Date(),
      },
      is_pinned: true,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date(),
      shared_with_count: 1,
    },
    {
      id: "2",
      title: "Beef Stew Recipe",
      current_version: {
        version_number: 2,
        is_published: true,
        published_at: new Date(),
      },
      is_pinned: false,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date(),
      shared_with_count: 1,
    },
    {
      id: "3",
      title: "Groceries",
      current_version: {
        version_number: 4,
        is_published: false,
        published_at: null,
      },
      is_pinned: false,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date(),
      shared_with_count: 3,
    },
  ];

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
    // TO DO - transfer this max w and margin auto into a layout. that should be universal
    <div>
      <AnimatedTypography variant="h1">{`Welcome, ${user?.firstName}!`}</AnimatedTypography>
      <div className="flex flex-col space-y-12">
        {/* global chat input */}
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
              items={notes}
              renderItem={(note) => <NoteWidget note={note} />}
              title={"Pinned"}
              icon={<PinIcon className="h-6 w-6 text-muted-foreground" />}
              delay={1 * STAGGER_DELAY} // Delay based on section index
            />
          </div>
        </AnimatedListItem>
        {/* Recent Notes */}
        <AnimatedListItem index={2} animation="fadeIn">
          <div>
            <WidgetList
              items={notes}
              renderItem={(note) => <NoteWidget note={note} />}
              title={"Recent"}
              icon={<Calendar1Icon className="h-6 w-6 text-muted-foreground" />}
              delay={2 * STAGGER_DELAY} // Delay based on section index
            />
          </div>
        </AnimatedListItem>
        {/* Recent Conversations */}
        <AnimatedListItem index={3} animation="fadeIn">
          <div>
            <WidgetList
              items={conversations}
              renderItem={(conversation) => (
                <ConversationWidget conversation={conversation} />
              )}
              title={"Chats & Conversations"}
              icon={
                <MessageSquareIcon className="h-6 w-6 text-muted-foreground" />
              }
              delay={3 * STAGGER_DELAY} // Delay based on section index
            />
          </div>
        </AnimatedListItem>
      </div>
    </div>
  );
};
export default WebDashboardContent;
