import { Skeleton } from "../ui/skeleton";
import MobileListSkeleton from "./MobileListSkeleton";

const MobileFolderPageSkeleton = () => {
  return (
    <div className="flex flex-col space-y-4">
      {/* Title/Header Skeleton */}
      <div className="h-10 px-4 flex items-center">
        <Skeleton className="h-6 w-32" />
      </div>
      <MobileListSkeleton showTitle={false} showAction={false} itemCount={3} />
    </div>
  );
};

export default MobileFolderPageSkeleton;
