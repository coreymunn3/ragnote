import { FolderWithItems } from "@/lib/types/folderTypes";
import { AnimatedListItem, AnimatedTypography } from "../animations";
import MobileListItem from "./MobileListItem";
import { Note } from "@/lib/types/noteTypes";
import OptionsMenu, { Option } from "../OptionsMenu";
import { ChatSession } from "@/lib/types/chatTypes";
import { TypographyP } from "../ui/typography";
import MobileListSkeleton from "../skeletons/MobileListSkeleton";

export type MobileListItemType = FolderWithItems | Note | ChatSession;
export type MobileListType = "folder" | "note" | "chat";

interface MobileListProps {
  type: MobileListType;
  title?: string;
  items?: MobileListItemType[];
  action?: React.ReactNode;
  options?: Option[];
  isLoading?: boolean;
  skeletonCount?: number;
}

const MobileList = ({
  type,
  title,
  items = [],
  action,
  options,
  isLoading = false,
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
        {items.map((item, index) => (
          <AnimatedListItem key={item.id} index={index} animation="fadeInRight">
            <MobileListItem
              type={type}
              item={item}
              isLastItem={index !== items.length - 1}
            />
          </AnimatedListItem>
        ))}
      </div>
    </div>
  );
};
export default MobileList;
