import { Skeleton } from "../ui/skeleton";

const EditorSkeleton = () => {
  return (
    <div className="w-full space-y-4">
      <Skeleton className="h-12 w-2/3 mb-8" /> {/* Title */}
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  );
};

export default EditorSkeleton;
