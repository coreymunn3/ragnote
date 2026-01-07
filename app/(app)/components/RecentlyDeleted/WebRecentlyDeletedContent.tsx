"use client";

import WidgetGrid from "@/components/web/WidgetGrid";
import NoteWidget from "@/components/web/NoteWidget";
import ChatWidget from "@/components/web/ChatWidget";
import {
  FileIcon,
  MessageSquareIcon,
  FolderIcon,
  TrashIcon,
} from "lucide-react";
import { AnimatedListItem, AnimatedTypography } from "@/components/animations";
import { useGetDeletedItems } from "@/hooks/deleted/useGetDeletedItems";
import { DeletedItemsCollection } from "@/lib/types/deletedTypes";
import { Card } from "@/components/ui/card";
import FolderWidget from "@/components/web/FolderWidget";

interface WebRecentlyDeletedContentProps {
  deletedItems: DeletedItemsCollection;
}

const WebRecentlyDeletedContent = ({
  deletedItems,
}: WebRecentlyDeletedContentProps) => {
  // re-fetch the deleted items
  const deletedData = useGetDeletedItems({
    initialData: deletedItems,
    staleTime: 0,
    refetchOnMount: true,
  });

  const data = deletedData.data;

  // If there are no deleted items at all, show empty state
  if (data && data.counts.total === 0) {
    return (
      <div>
        <AnimatedTypography variant="h1">Recently Deleted</AnimatedTypography>
        <AnimatedListItem index={0} animation="fadeIn">
          <Card className="p-12 text-center">
            <TrashIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">
              No deleted items. Items you delete will appear here.
            </p>
          </Card>
        </AnimatedListItem>
      </div>
    );
  }

  return (
    <div>
      <AnimatedTypography variant="h1">Recently Deleted</AnimatedTypography>
      <div className="flex flex-col space-y-8">
        {/* Deleted Folders */}
        {data && data.counts.folders > 0 && (
          <AnimatedListItem index={0} animation="fadeIn">
            <WidgetGrid
              items={data.folders}
              renderItem={(folder) => <FolderWidget folder={folder} />}
              title="Deleted Folders"
              icon={<FolderIcon className="h-6 w-6 text-muted-foreground" />}
              emptyContentMessage="No deleted folders."
              initialItemLimit={6}
              showMoreIncrement={6}
              showMoreButton={true}
              delay={0}
            />
          </AnimatedListItem>
        )}

        {/* Deleted Notes */}
        {data && data.counts.notes > 0 && (
          <AnimatedListItem index={1} animation="fadeIn">
            <WidgetGrid
              items={data.notes}
              renderItem={(note) => <NoteWidget note={note} />}
              title="Deleted Notes"
              icon={<FileIcon className="h-6 w-6 text-muted-foreground" />}
              emptyContentMessage="No deleted notes."
              initialItemLimit={6}
              showMoreIncrement={6}
              showMoreButton={true}
              delay={1}
            />
          </AnimatedListItem>
        )}

        {/* Deleted Chats */}
        {data && data.counts.chats > 0 && (
          <AnimatedListItem index={2} animation="fadeIn">
            <WidgetGrid
              items={data.chats}
              renderItem={(chatSession) => (
                <ChatWidget chatSession={chatSession} />
              )}
              title="Deleted Chats"
              icon={
                <MessageSquareIcon className="h-6 w-6 text-muted-foreground" />
              }
              emptyContentMessage="No deleted chats."
              initialItemLimit={6}
              showMoreIncrement={6}
              showMoreButton={true}
              delay={2}
            />
          </AnimatedListItem>
        )}
      </div>
    </div>
  );
};
export default WebRecentlyDeletedContent;
