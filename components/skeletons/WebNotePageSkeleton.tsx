import { Skeleton } from "../ui/skeleton";
import ToolbarSkeleton from "./WebToolbarSkeleton";

const WebNotePageSkeleton = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Toolbar */}
      <div className="flex-shrink-0">
        <ToolbarSkeleton variant="note" />
      </div>

      {/* Editor Skeleton */}
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full space-y-4">
        <Skeleton className="h-12 w-2/3 mb-8" /> {/* Title */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
};

export default WebNotePageSkeleton;
