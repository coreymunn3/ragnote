"use client";
import Link from "next/link";
import { Button } from "../ui/button";
import { getFolderIcon } from "@/lib/utils";
import { TypographyP } from "../ui/typography";
import { ChevronRight } from "lucide-react";
import { MobileListItemType, MobileListType } from "./MobileList";
import { FolderWithItems } from "@/lib/types/folderTypes";
import { Note } from "@/lib/types/noteTypes";
import VersionBadge from "../VersionBadge";
import { ChatSession } from "@/lib/types/chatTypes";

interface MobileListItemProps {
  type: MobileListType;
  item: MobileListItemType;
  isLastItem: boolean;
}

interface DetailElement {
  displayName: string;
  href: string;
  icon?: React.ReactElement;
  detailElement?: React.ReactElement;
}

const MobileListItem = ({ type, item, isLastItem }: MobileListItemProps) => {
  const itemData = ((): DetailElement => {
    switch (type) {
      case "folder":
        const folder = item as FolderWithItems;
        return {
          displayName: folder.folder_name,
          href: folder.href,
          icon: getFolderIcon(folder.id),
          detailElement: (
            <>
              <TypographyP>{folder.items.length}</TypographyP>
              <ChevronRight className="h-4 w-4" />
            </>
          ),
        };
      case "note":
        const note = item as Note;
        return {
          displayName: note.title,
          href: `/note/${note.id}`,
          icon: undefined,
          detailElement: <VersionBadge version={note.current_version} />,
        };
      case "chat":
        const chat = item as ChatSession;
        return {
          displayName: chat.title || "your chat",
          href: `/chat/${chat.id}`,
          icon: getFolderIcon("system_chats"),
          detailElement: (
            <>
              <TypographyP>{`(${chat.messages_count})`}</TypographyP>
            </>
          ),
        };
    }
  })();

  return (
    <div>
      <Button
        variant={"ghost"}
        className="w-full px-8 h-12
      "
        asChild
      >
        <Link href={itemData.href}>
          {/* item Name and optional Icon */}
          <div className="w-full flex items-center justify-between">
            {/* left side - icon and name */}
            <div className="flex items-center space-x-2">
              {Boolean(itemData.icon) && itemData.icon}
              <span>{itemData.displayName}</span>
            </div>
            {/* right side - detail */}
            <div className="flex items-center space-x-2 text-muted-foreground">
              {itemData.detailElement}
            </div>
          </div>
        </Link>
      </Button>
      {isLastItem && <hr className="border-sidebar-border"></hr>}
    </div>
  );
};
export default MobileListItem;
