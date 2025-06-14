import {
  TypographyH1,
  TypographyH2,
  TypographyH3,
} from "@/components/ui/typgrophy";
import NotesList from "@/components/web/NotesList";
import { Note } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";

const WebDashboardContent = async () => {
  const user = await currentUser();

  // TO DO - get recent notes
  const recent = [
    {
      id: "1",
      title: "Trips I want to take in 2025",
      current_version: {
        version_number: 7,
        is_published: true,
        published_at: new Date(),
      },
      is_pinned: false,
      is_deleted: false,
      created_at: new Date(),
      updated_at: new Date(),
      shared_with_count: 0,
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
      shared_with_count: 0,
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
      shared_with_count: 0,
    },
  ];
  return (
    // TO DO - transfer this max w and margin auto into a layout. that should be universal
    <div>
      <TypographyH1>{`Welcome, ${user?.firstName}!`}</TypographyH1>
      <div className="flex flex-col space-y-20">
        {/* global chat input */}
        <div className="h-40 border border-primary rounded-md p-4">
          <p>
            Here, we will show a prominant chat input allowing you to chat with
            all your notes
          </p>
        </div>
        {/* Pinned Notes */}
        <div>
          <TypographyH3>Pinned Notes</TypographyH3>
          <p>test</p>
        </div>
        {/* Recent Notes */}
        <div>
          <NotesList
            notes={recent}
            title={<TypographyH3>Recent Notes</TypographyH3>}
          />
        </div>
        {/* Recent Conversations */}
        <div>
          <TypographyH3>Recent Chats & Conversations</TypographyH3>
          <p>test</p>
        </div>
      </div>
    </div>
  );
};
export default WebDashboardContent;
