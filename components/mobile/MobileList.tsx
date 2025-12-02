import { FolderWithItems } from "@/lib/types/folderTypes";
import { AnimatedListItem, AnimatedTypography } from "../animations";
import MobileListItem from "./MobileListItem";
import { Note } from "@/lib/types/noteTypes";
import OptionsMenu, { Option } from "../OptionsMenu";
import { ChatSession } from "@/lib/types/chatTypes";
import { Skeleton } from "../ui/skeleton";
import { TypographyP } from "../ui/typography";

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

const MobileListItemSkeleton = ({ isLast }: { isLast: boolean }) => (
  <div>
    <div className="w-full px-8 h-12 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-4" />
      </div>
    </div>
    {isLast && <hr className="border-sidebar-border" />}
  </div>
);

const MobileList = ({
  type,
  title,
  items = [],
  action,
  options,
  isLoading = false,
  skeletonCount = 3,
}: MobileListProps) => {
  return (
    <div>
      {/* the title & options/actions if provided*/}
      {(title || action || options?.length) && (
        <div className="flex justify-between items-center px-4 pb-2 space-x-2">
          {/* title */}
          {title && (
            <TypographyP className="font-semibold">{title}</TypographyP>
          )}
          {/* options and action if provided */}
          {isLoading ? (
            <>
              <Skeleton className="h-6 w-6" />
            </>
          ) : (
            <div>
              {action}
              {options?.length && <OptionsMenu options={options} />}
            </div>
          )}
        </div>
      )}
      {/* the items in this section - show skeletons if loading */}
      <div className="rounded-md bg-background">
        {isLoading
          ? Array.from({ length: skeletonCount }).map((_, index) => (
              <MobileListItemSkeleton
                key={`skeleton-${index}`}
                isLast={index !== skeletonCount - 1}
              />
            ))
          : items.map((item, index) => (
              <AnimatedListItem
                key={item.id}
                index={index}
                animation="fadeInRight"
              >
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
