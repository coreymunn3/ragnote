import { Button } from "../ui/button";
import Link from "next/link";
import { FileIcon } from "lucide-react";

interface ListItem {
  id: string;
  title: string | null;
}

interface FolderItemRendererProps {
  item: ListItem;
  routePrefix: string;
}

const FolderItemRenderer = ({ item, routePrefix }: FolderItemRendererProps) => {
  return (
    <Button
      variant={"ghost"}
      className="flex justify-start p-0 hover:bg-primary/20 min-w-0"
      asChild
    >
      <Link
        href={`${routePrefix}/${item.id}`}
        className="flex items-center space-x-2 min-w-0 flex-1"
      >
        <FileIcon className="h-4 w-4 flex-shrink-0" />
        <p className="truncate" title={item.title || undefined}>
          {item.title}
        </p>
      </Link>
    </Button>
  );
};

export default FolderItemRenderer;
