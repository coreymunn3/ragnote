import { FolderWithItems } from "@/lib/types/folderTypes";
import MobileListItem from "./MobileListItem";
import { Note } from "@/lib/types/noteTypes";
import OptionsMenu, { Option } from "../OptionsMenu";
import { ChatSession } from "@/lib/types/chatTypes";
import { TypographyMuted, TypographyP } from "../ui/typography";
import MobileListSkeleton from "../skeletons/MobileListSkeleton";
import { LucideIcon } from "lucide-react";

export interface SystemLinkItem {
  id: string; // a placeholder
  href: string;
  icon: LucideIcon;
  label: string;
}

export type MobileListItemType =
  | FolderWithItems
  | Note
  | ChatSession
  | SystemLinkItem;
export type MobileListType = "folder" | "note" | "chat" | "link";

interface MobileListProps {
  type: MobileListType;
  title?: string;
  items?: MobileListItemType[];
  action?: React.ReactNode;
  options?: Option[];
  isLoading?: boolean;
  emptyContentMessage?: string;
  skeletonCount?: number;
}

const MobileList = ({
  type,
  title,
  items = [],
  action,
  options,
  isLoading = false,
  emptyContentMessage = "Nothing yet",
  skeletonCount = 3,
}: MobileListProps) => {
  // If loading, show skeleton
  if (isLoading) {
    return (
      <MobileListSkeleton
        showTitle={Boolean(title)}
        showAction={Boolean(action || options?.length)}
        itemCount={skeletonCount}
      />
    );
  }

  // Otherwise show actual content
  return (
    <div>
      {/* the title & options/actions if provided*/}
      {(title || action || options?.length) && (
        <div className="h-10 flex justify-between items-center px-4 pb-2 space-x-2">
          {/* title */}
          {title && (
            <TypographyP className="font-semibold">{title}</TypographyP>
          )}
          {/* options and action if provided */}
          <div>
            {action}
            {options?.length && <OptionsMenu options={options} />}
          </div>
        </div>
      )}
      {/* the items in this section */}
      <div className="rounded-md bg-background">
        {/* display an empty content message if no items */}
        {!items.length && (
          <div className="w-full px-4 h-14 flex items-center justify-between hover:bg-accent/50 transition-colors">
            <TypographyMuted>{emptyContentMessage}</TypographyMuted>
          </div>
        )}
        {/* otherwise, display the items */}
        {items.length > 0 &&
          items.map((item, index) => (
            <MobileListItem
              key={item.id}
              type={type}
              item={item}
              isLastItem={index !== items.length - 1}
            />
          ))}
      </div>
    </div>
  );
};
export default MobileList;
