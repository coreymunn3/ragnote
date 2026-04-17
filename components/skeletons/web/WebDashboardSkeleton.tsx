import { Skeleton } from "../ui/skeleton";
import WidgetGridSkeleton from "./WidgetGridSkeleton";

const WebDashboardSkeleton = () => {
  return (
    <div>
      <Skeleton className="h-10 w-48 mb-8" /> {/* Welcome title */}
      <div className="flex flex-col space-y-8">
        {/* Integrated Search */}
        <div className="w-full">
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>

        {/* Pinned Notes */}
        <WidgetGridSkeleton title="Pinned Notes" count={2} />

        {/* Recent Notes */}
        <WidgetGridSkeleton title="Recent Notes" count={4} />

        {/* Recent Chats */}
        <WidgetGridSkeleton title="Recent Chats" count={4} />
      </div>
    </div>
  );
};

export default WebDashboardSkeleton;
