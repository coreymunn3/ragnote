import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TypographyH1 } from "@/components/ui/typgrophy";
import WidgetList from "@/components/web/WidgetList";
import NoteWidget from "@/components/web/NoteWidget";
import ConversationWidget from "@/components/web/ConversationWidget";
import { currentUser } from "@clerk/nextjs/server";
import { Calendar1Icon, MessageSquareIcon, PinIcon } from "lucide-react";

const WebDashboardContent = async () => {
  const user = await currentUser();

  // TO DO - get recent notes
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
      <TypographyH1>{`Welcome, ${user?.firstName}!`}</TypographyH1>
      <div className="flex flex-col space-y-12">
        {/* global chat input */}
        <Card className="min-h-[200px]">
          <CardHeader>
            <CardTitle>Chat with your notes</CardTitle>
            <CardDescription>
              Here we will show an input to chat with all your notes
            </CardDescription>
          </CardHeader>
        </Card>
        {/* Pinned Notes */}
        <div>
          <WidgetList
            items={notes}
            renderItem={(note) => <NoteWidget note={note} />}
            title={"Pinned"}
            icon={<PinIcon className="h-6 w-6 text-muted-foreground" />}
          />
        </div>
        {/* Recent Notes */}
        <div>
          <WidgetList
            items={notes}
            renderItem={(note) => <NoteWidget note={note} />}
            title={"Recent"}
            icon={<Calendar1Icon className="h-6 w-6 text-muted-foreground" />}
          />
        </div>
        {/* Recent Conversations */}
        <div>
          <WidgetList
            items={conversations}
            renderItem={(conversation) => (
              <ConversationWidget conversation={conversation} />
            )}
            title={"Recent Chats & Conversations"}
            icon={
              <MessageSquareIcon className="h-6 w-6 text-muted-foreground" />
            }
          />
        </div>
      </div>
    </div>
  );
};
export default WebDashboardContent;
