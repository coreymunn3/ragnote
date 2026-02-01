import MobileListSkeleton from "./MobileListSkeleton";

const MobileFolderPageSkeleton = () => {
  return (
    <div className="flex flex-col space-y-4">
      {/* Title/Header Skeleton */}
      <div className="h-10 px-4 flex items-center">
        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
      </div>
      <MobileListSkeleton showTitle={false} showAction={false} itemCount={3} />
    </div>
  );
};

export default MobileFolderPageSkeleton;
