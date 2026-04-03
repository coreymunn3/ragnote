"use client";
import CreateFolder from "@/components/CreateFolder";
import MobileList, { SystemLinkItem } from "@/components/mobile/MobileList";
import CommandBar from "@/components/commandbar/CommandBar";
import { useGetFolders } from "@/hooks/folder/useGetFolders";
import { MessageSquareIcon, Trash2Icon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetNotes } from "@/hooks/note/useGetNotes";
import MobileDashboardSkeleton from "@/components/skeletons/MobileDashboardSkeleton";

const MobileDashboardContent = () => {
  // Fetch the user's folders client-side
  const folders = useGetFolders();

  // fetch the user's notes
  const userNotes = useGetNotes();

  // Show skeleton while loading
  if (folders.isLoading || userNotes.isLoading) {
    return <MobileDashboardSkeleton />;
  }

  // separate pinned/recent notes
  const pinnedNotes = userNotes.data?.filter((note) => note.is_pinned) || [];
  const recentNotes =
    userNotes.data
      ?.filter((note) => !note.is_pinned)
      .sort(
        (a, b) =>
          new Date(b.current_version.updated_at).getTime() -
          new Date(a.current_version.updated_at).getTime(),
      ) || [];

  // Define system links
  const systemLinks: SystemLinkItem[] = [
    {
      id: "chats-link",
      href: "/chats",
      icon: MessageSquareIcon,
      label: "Chats",
    },
    {
      id: "recently-deleted-link",
      href: "/recently-deleted",
      icon: Trash2Icon,
      label: "Recently Deleted",
    },
  ];

  return (
    <div className="flex flex-col space-y-4">
      <CommandBar scope="global" />
      <Tabs defaultValue="folders">
        <TabsList>
          <TabsTrigger value="folders">Folders</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
        <TabsContent value="folders">
          <div className="flex flex-col space-y-2">
            {/* users folders */}
            <MobileList
              title="Your Folders"
              items={folders.data}
              type="folder"
              isLoading={folders.isLoading}
              action={<CreateFolder />}
              emptyContentMessage="No folders yet. Create a folder to get started."
            />
            {/* system folders */}
            <MobileList title="System" items={systemLinks} type="link" />
          </div>
        </TabsContent>
        <TabsContent value="notes">
          <div className="flex flex-col space-y-2">
            {/* Pinned Notes */}
            <MobileList
              title="Your Pinned Notes"
              items={pinnedNotes}
              type="note"
              isLoading={userNotes.isLoading}
              emptyContentMessage="No pinned notes yet."
            />
            {/* All Other Notes (sorted recent) */}
            <MobileList
              title="Recent Notes"
              items={recentNotes}
              type="note"
              isLoading={userNotes.isLoading}
              emptyContentMessage="No notes yet. Create a note to get started"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
export default MobileDashboardContent;
