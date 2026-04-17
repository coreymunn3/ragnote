import { Skeleton } from "@/components/ui/skeleton";
import WidgetGridSkeleton from "./WidgetGridSkeleton";

const WebFolderPageSkeleton = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <Skeleton className="h-10 w-48" /> {/* Title */}
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>

      <WidgetGridSkeleton count={8} />
    </div>
  );
};

export default WebFolderPageSkeleton;
