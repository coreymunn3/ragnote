"use client";
import { useEffect } from "react";
import MobileList from "@/components/mobile/MobileList";
import { useGetDeletedItems } from "@/hooks/deleted/useGetDeletedItems";
import { DeletedItemsCollection } from "@/lib/types/deletedTypes";
import { useMobileHeader } from "@/contexts/MobileHeaderContext";
import { ArrowLeftIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import MobilePageTitle from "@/components/mobile/MobilePageTitle";
import MobileBackButton from "@/components/mobile/MobileBackButton";

interface MobileRecentlyDeletedContentProps {
  deletedItems: DeletedItemsCollection;
}

const MobileRecentlyDeletedContent = ({
  deletedItems,
}: MobileRecentlyDeletedContentProps) => {
  const router = useRouter();
  const { setHeaderConfig, resetHeaderConfig } = useMobileHeader();

  // Set header configuration for Recently Deleted
  useEffect(() => {
    setHeaderConfig({
      leftContent: (
        <div className="flex items-center space-x-2">
          <MobileBackButton onClick={() => router.push("/dashboard")} />
          <MobilePageTitle title="Recently Deleted" />
        </div>
      ),
      rightContent: null,
    });

    return () => {
      resetHeaderConfig();
    };
  }, [setHeaderConfig, resetHeaderConfig, router]);

  // re-fetch the deleted items
  const deletedData = useGetDeletedItems({
    placeholderData: deletedItems,
  });

  // Transform PrismaFolder to FolderWithItems for MobileList
  const deletedFoldersWithItems =
    deletedData.data?.folders.map((folder) => ({
      ...folder,
      href: `/folder/${folder.id}`,
      items: [],
      itemType: "note" as const,
    })) || [];

  return (
    <div className="flex flex-col space-y-4">
      {/* Deleted Folders */}
      {deletedData.data && deletedData.data.counts.folders > 0 && (
        <MobileList
          title="Deleted Folders"
          items={deletedFoldersWithItems}
          type="folder"
          isLoading={deletedData.isLoading}
          emptyContentMessage="No deleted folders."
        />
      )}

      {/* Deleted Notes */}
      {deletedData.data && deletedData.data.counts.notes > 0 && (
        <MobileList
          title="Deleted Notes"
          items={deletedData.data.notes}
          type="note"
          isLoading={deletedData.isLoading}
          emptyContentMessage="No deleted notes."
        />
      )}

      {/* Deleted Chats */}
      {deletedData.data && deletedData.data.counts.chats > 0 && (
        <MobileList
          title="Deleted Chats"
          items={deletedData.data.chats}
          type="chat"
          isLoading={deletedData.isLoading}
          emptyContentMessage="No deleted chats."
        />
      )}

      {/* Empty state - when no items at all */}
      {deletedData.data && deletedData.data.counts.total === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <TrashIcon className="h-16 w-16 mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">
            No deleted items. Items you delete will appear here.
          </p>
        </div>
      )}
    </div>
  );
};
export default MobileRecentlyDeletedContent;
