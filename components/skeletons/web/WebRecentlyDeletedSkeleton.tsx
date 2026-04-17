import { Skeleton } from "../ui/skeleton";
import WidgetGridSkeleton from "./WidgetGridSkeleton";

const WebRecentlyDeletedSkeleton = () => {
  return (
    <div>
      <Skeleton className="h-10 w-64 mb-8" /> {/* Page Title */}
      <div className="flex flex-col space-y-8">
        <WidgetGridSkeleton title="Deleted Folders" count={3} />
        <WidgetGridSkeleton title="Deleted Notes" count={3} />
        <WidgetGridSkeleton title="Deleted Chats" count={3} />
      </div>
    </div>
  );
};

export default WebRecentlyDeletedSkeleton;
