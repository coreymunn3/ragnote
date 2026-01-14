import { Skeleton } from "../ui/skeleton";
import EditorSkeleton from "./EditorSkeleton";

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
      <div className="flex-1 p-4">
        <EditorSkeleton />
      </div>
    </div>
  );
};

export default MobileNotePageSkeleton;
