import { Skeleton } from "../ui/skeleton";

interface WidgetGridSkeletonProps {
  title?: string;
  count?: number;
}

const WidgetGridSkeleton = ({ title, count = 4 }: WidgetGridSkeletonProps) => (
  <div className="space-y-4">
    {title && (
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-6 w-32" />
      </div>
    )}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-lg" />
      ))}
    </div>
  </div>
);

export default WidgetGridSkeleton;
