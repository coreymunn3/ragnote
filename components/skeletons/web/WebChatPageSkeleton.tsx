import { Skeleton } from "../ui/skeleton";
import ToolbarSkeleton from "./WebToolbarSkeleton";

const WebChatPageSkeleton = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Toolbar Skeleton */}
      <div className="flex-shrink-0">
        <ToolbarSkeleton variant="chat" />
      </div>

      {/* Chat Messages Skeleton */}
      <div className="flex-1 overflow-hidden p-4 space-y-4">
        {/* User message */}
        <div className="flex justify-end">
          <Skeleton className="h-10 w-2/3 rounded-lg" />
        </div>
        {/* AI message */}
        <div className="flex justify-start">
          <Skeleton className="h-20 w-3/4 rounded-lg" />
        </div>
        {/* User message */}
        <div className="flex justify-end">
          <Skeleton className="h-12 w-1/2 rounded-lg" />
        </div>
        {/* AI message */}
        <div className="flex justify-start">
          <Skeleton className="h-32 w-3/4 rounded-lg" />
        </div>
      </div>

      {/* Chat Input Skeleton */}
      <div className="flex-shrink-0 p-4">
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  );
};

export default WebChatPageSkeleton;
