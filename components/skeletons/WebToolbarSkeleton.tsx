import { Skeleton } from "../ui/skeleton";

interface ToolbarSkeletonProps {
  variant?: "chat" | "note";
}

const ToolbarSkeleton = ({ variant = "chat" }: ToolbarSkeletonProps) => {
  if (variant === "note") {
    return (
      <div className="flex items-center justify-between px-14 py-2">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-16" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    );
  }

  // chat variant
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-8 w-10" />
      </div>
    </div>
  );
};

export default ToolbarSkeleton;
