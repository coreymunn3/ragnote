import { Skeleton } from "../ui/skeleton";
import { SidebarMenu, SidebarMenuItem } from "../ui/sidebar";
import { AnimatedListItem } from "../animations";

interface FolderListSkeletonProps {
  itemCount?: number;
}

const FolderListSkeleton = ({ itemCount = 3 }: FolderListSkeletonProps) => {
  return (
    <SidebarMenu>
      {Array.from({ length: itemCount }).map((_, index) => (
        <SidebarMenuItem key={`skeleton-${index}`}>
          <AnimatedListItem index={index} animation="fadeInRight">
            <div className="flex items-center gap-2 p-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 flex-1 rounded" />
            </div>
          </AnimatedListItem>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
};

export default FolderListSkeleton;
