import { Skeleton } from "../ui/skeleton";

interface MobileListSkeletonProps {
  showTitle?: boolean;
  showAction?: boolean;
  itemCount?: number;
}

const MobileListItemSkeleton = ({ isLast }: { isLast: boolean }) => (
  <div>
    <div className="w-full px-4 h-14 flex items-center justify-between">
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

const MobileListSkeleton = ({
  showTitle = true,
  showAction = true,
  itemCount = 3,
}: MobileListSkeletonProps) => {
  return (
    <div>
      {/* Title and action skeleton */}
      {(showTitle || showAction) && (
        <div className="h-10 flex justify-between items-center px-4 pb-2 space-x-2">
          {showTitle && <Skeleton className="h-5 w-32" />}
          {showAction && <Skeleton className="h-6 w-6" />}
        </div>
      )}
      {/* List items skeleton */}
      <div className="rounded-md bg-background">
        {Array.from({ length: itemCount }).map((_, index) => (
          <MobileListItemSkeleton
            key={`skeleton-${index}`}
            isLast={index !== itemCount - 1}
          />
        ))}
      </div>
    </div>
  );
};

export default MobileListSkeleton;
