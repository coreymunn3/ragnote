import MobileListSkeleton from "./MobileListSkeleton";

const MobileRecentlyDeletedSkeleton = () => {
  return (
    <div className="flex flex-col space-y-4">
      <MobileListSkeleton showTitle={true} showAction={false} itemCount={3} />
      <MobileListSkeleton showTitle={true} showAction={false} itemCount={3} />
      <MobileListSkeleton showTitle={true} showAction={false} itemCount={3} />
    </div>
  );
};

export default MobileRecentlyDeletedSkeleton;
