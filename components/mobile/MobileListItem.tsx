"use client";
import Link from "next/link";
import { Button } from "../ui/button";
import { getFolderIcon } from "@/lib/utils";
import { MobileListItemType, MobileListType } from "./MobileList";
import { FolderWithItems } from "@/lib/types/folderTypes";
import { Note } from "@/lib/types/noteTypes";
import { ChatSession } from "@/lib/types/chatTypes";
import MobileListItemNoteDetail from "./MobileListItemNoteDetail";
import MobileListItemChatDetail from "./MobileListItemChatDetail";
import MobileListItemFolderDetail from "./MobileListItemFolderDetail";

interface MobileListItemProps {
  type: MobileListType;
  item: MobileListItemType;
  isLastItem: boolean;
}

interface DetailElement {
  displayName: string;
  description?: string;
  href: string;
  icon?: React.ReactElement;
  detailElement?: React.ReactElement;
}

const MobileListItem = ({ type, item, isLastItem }: MobileListItemProps) => {
  // console.log(type, item);
  const itemData = ((): DetailElement => {
    switch (type) {
      case "folder":
        const folder = item as FolderWithItems;
        return {
          displayName: folder.folder_name,
          href: folder.href,
          icon: getFolderIcon(folder.id),
          detailElement: <MobileListItemFolderDetail folder={folder} />,
        };
      case "note":
        const note = item as Note;
        return {
          displayName: note.title,
          description: note.preview,
          href: `/note/${note.id}`,
          icon: undefined,
          detailElement: <MobileListItemNoteDetail note={note} />,
        };
      case "chat":
        const chat = item as ChatSession;
        return {
          displayName: chat.title || "your chat",
          href: `/chat/${chat.id}`,
          icon: getFolderIcon("system_chats"),
          detailElement: <MobileListItemChatDetail chat={chat} />,
        };
    }
  })();

  return (
    <div>
      <div className="w-full px-4 h-14 flex items-center justify-between hover:bg-accent/50 transition-colors">
        {/* Left side - clickable link with icon and name */}
        <Link
          href={itemData.href}
          className="flex flex-1 items-center space-x-2 overflow-hidden min-w-0 py-2"
        >
          {Boolean(itemData.icon) && itemData.icon}
          <div className="flex flex-col w-full overflow-hidden min-w-0">
            <span className="truncate">{itemData.displayName}</span>
            <span className="text-xs text-foreground/40 truncate">
              {itemData?.description}
            </span>
          </div>
        </Link>
        {/* Right side - detail element (not wrapped in Link) */}
        <div className="flex items-center space-x-2 text-muted-foreground">
          {itemData.detailElement}
        </div>
      </div>
      {isLastItem && <hr className="border-sidebar-border"></hr>}
    </div>
  );
};
export default MobileListItem;
