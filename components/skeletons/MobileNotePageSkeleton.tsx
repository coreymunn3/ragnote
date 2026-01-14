import { Skeleton } from "../ui/skeleton";

const MobileNotePageSkeleton = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Toolbar Skeleton */}
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-6 w-16 rounded-md" /> {/* Version */}
          <Skeleton className="h-4 w-12 rounded-full" /> {/* Status */}
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded-full" /> {/* Chat */}
          <Skeleton className="h-8 w-8 rounded-full" /> {/* Publish */}
        </div>
      </div>

      {/* Editor Skeleton */}
      <div className="flex-1 p-4 space-y-4">
        <Skeleton className="h-10 w-3/4" /> {/* Title */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
};

export default MobileNotePageSkeleton;
