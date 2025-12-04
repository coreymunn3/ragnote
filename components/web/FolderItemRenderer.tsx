import { Button } from "../ui/button";
import Link from "next/link";
import { FileIcon, MessageSquare } from "lucide-react";
import { FolderItemType } from "@/lib/types/folderTypes";

interface ListItem {
  id: string;
  title: string | null;
}

interface FolderItemRendererProps {
  item: ListItem;
  itemType: FolderItemType;
}

const FolderItemRenderer = ({ item, itemType }: FolderItemRendererProps) => {
  const routePrefix = itemType === "note" ? "/note" : "/chat";

  return (
    <Button
      variant={"ghost"}
      className="flex justify-start p-0 hover:bg-primary dark:hover:bg-primary hover:text-primary-foreground min-w-0"
      asChild
    >
      <Link
        href={`${routePrefix}/${item.id}`}
        className="flex items-center space-x-2 min-w-0 flex-1"
      >
        {itemType === "note" ? (
          <FileIcon className="h-4 w-4 flex-shrink-0" />
        ) : (
          <MessageSquare className="h-4 w-4 flex-shrink-0" />
        )}

        <p className="truncate" title={item.title || undefined}>
          {item.title}
        </p>
      </Link>
    </Button>
  );
};

export default FolderItemRenderer;
