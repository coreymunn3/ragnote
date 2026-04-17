import { Skeleton } from "../../ui/skeleton";
import MobileListSkeleton from "./MobileListSkeleton";

const MobileDashboardSkeleton = () => {
  return (
    <div className="flex flex-col space-y-4">
      {/* Integrated Search Skeleton */}
      <div className="h-10 w-full px-4">
        <Skeleton className="h-full w-full rounded-md" />
      </div>

      {/* Folders List Skeleton */}
      <MobileListSkeleton showTitle={true} showAction={true} itemCount={3} />

      {/* System Links Skeleton */}
      <MobileListSkeleton showTitle={true} showAction={false} itemCount={2} />
    </div>
  );
};

export default MobileDashboardSkeleton;
