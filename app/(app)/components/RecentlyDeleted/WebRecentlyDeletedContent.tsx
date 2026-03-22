"use client";

import WidgetGrid from "@/components/web/WidgetGrid";
import NoteWidget from "@/components/web/NoteWidget";
import ChatWidget from "@/components/web/ChatWidget";
import { FileIcon, MessageSquareIcon, FolderIcon } from "lucide-react";
import { AnimatedListItem, AnimatedTypography } from "@/components/animations";
import { useGetDeletedItems } from "@/hooks/deleted/useGetDeletedItems";
import { DeletedItemsCollection } from "@/lib/types/deletedTypes";
import FolderWidget from "@/components/web/FolderWidget";

interface WebRecentlyDeletedContentProps {
  deletedItems: DeletedItemsCollection;
}

const WebRecentlyDeletedContent = ({
  deletedItems,
}: WebRecentlyDeletedContentProps) => {
  // re-fetch the deleted items
  const deletedData = useGetDeletedItems({
    placeholderData: deletedItems,
  });

  const data = deletedData.data;

  return (
    <div>
      <AnimatedTypography variant="h1">Recently Deleted</AnimatedTypography>
      <div className="flex flex-col space-y-8">
        {/* Deleted Folders */}
        <AnimatedListItem index={0} animation="fadeIn">
          <WidgetGrid
            items={data?.folders || []}
            renderItem={(folder) => <FolderWidget folder={folder} />}
            title="Deleted Folders"
            icon={<FolderIcon className="h-6 w-6 text-muted-foreground" />}
            emptyContentMessage="No deleted folders yet."
            delay={0}
          />
        </AnimatedListItem>

        {/* Deleted Notes */}
        <AnimatedListItem index={1} animation="fadeIn">
          <WidgetGrid
            items={data?.notes || []}
            renderItem={(note) => <NoteWidget note={note} />}
            title="Deleted Notes"
            icon={<FileIcon className="h-6 w-6 text-muted-foreground" />}
            emptyContentMessage="No deleted notes yet."
            delay={1}
          />
        </AnimatedListItem>

        {/* Deleted Chats */}
        <AnimatedListItem index={2} animation="fadeIn">
          <WidgetGrid
            items={data?.chats || []}
            renderItem={(chatSession) => (
              <ChatWidget chatSession={chatSession} />
            )}
            title="Deleted Chats"
            icon={
              <MessageSquareIcon className="h-6 w-6 text-muted-foreground" />
            }
            emptyContentMessage="No deleted chats yet."
            delay={2}
          />
        </AnimatedListItem>
      </div>
    </div>
  );
};
export default WebRecentlyDeletedContent;
