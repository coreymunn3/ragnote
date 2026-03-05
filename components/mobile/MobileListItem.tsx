"use client";
import { useState } from "react";
import Link from "next/link";
import { getFolderIcon } from "@/lib/utils";
import {
  MobileListItemType,
  MobileListType,
  SystemLinkItem,
} from "./MobileList";
import { FolderWithItems } from "@/lib/types/folderTypes";
import { Note } from "@/lib/types/noteTypes";
import { ChatSession } from "@/lib/types/chatTypes";
import MobileListItemNoteDetail from "./MobileListItemNoteDetail";
import MobileListItemChatDetail from "./MobileListItemChatDetail";
import MobileListItemFolderDetail from "./MobileListItemFolderDetail";
import { TypographyP } from "../ui/typography";
import { AnimatedExpandable } from "@/components/animations";
import FolderItemRenderer from "../web/FolderItemRenderer";

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
  const [isOpen, setIsOpen] = useState(false);

  // Check if the item is pinned (for notes and chats)
  const isPinned =
    (type === "note" && (item as Note).is_pinned) ||
    (type === "chat" && (item as ChatSession).is_pinned);

  // console.log(type, item);
  const itemData = ((): DetailElement => {
    switch (type) {
      case "folder":
        const folder = item as FolderWithItems;
        return {
          displayName: folder.folder_name,
          href: folder.href,
          icon: getFolderIcon(folder.id),
          detailElement: (
            <MobileListItemFolderDetail
              folder={folder}
              isOpen={isOpen}
              onToggle={() => setIsOpen(!isOpen)}
            />
          ),
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
          icon: getFolderIcon("chat"),
          detailElement: <MobileListItemChatDetail chatSession={chat} />,
        };
      case "link":
        const link = item as SystemLinkItem;
        const Icon = link.icon;
        return {
          displayName: link.label,
          href: link.href,
          icon: <Icon className="h-5 w-5 text-muted-foreground" />,
          detailElement: undefined,
        };
    }
  })();

  return (
    <div>
      <div
        className={`w-full px-4 h-14 flex items-center justify-between hover:bg-accent/50 transition-colors ${isPinned && "bg-primary/10 rounded-md"}`}
      >
        {/* Left side - clickable link with icon and name */}
        <Link
          href={itemData.href}
          className="flex flex-1 items-center space-x-2 overflow-hidden min-w-0 py-2"
        >
          {Boolean(itemData.icon) && itemData.icon}
          <div className="flex flex-col w-full overflow-hidden min-w-0">
            <TypographyP className="truncate">
              {itemData.displayName}
            </TypographyP>
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
      {/* Expandable folder contents */}
      {type === "folder" && (
        <AnimatedExpandable isOpen={isOpen}>
          <div className="pl-8 pr-4 pb-2 space-y-1">
            {(item as FolderWithItems).items.map((folderItem) => (
              <FolderItemRenderer
                key={folderItem.id}
                item={folderItem}
                itemType={(item as FolderWithItems).itemType}
              />
            ))}
          </div>
        </AnimatedExpandable>
      )}
      {isLastItem && <hr className="border-sidebar-border"></hr>}
    </div>
  );
};
export default MobileListItem;
