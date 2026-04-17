import { Skeleton } from "@/components/ui/skeleton";

const ChatHistoryHeaderSkeleton = () => {
  return (
    <>
      <Skeleton className="h-6 w-6"></Skeleton>
      <Skeleton className="h-6 w-36"></Skeleton>
    </>
  );
};

export default ChatHistoryHeaderSkeleton;
