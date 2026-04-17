import { Skeleton } from "@/components/ui/skeleton";
import WidgetGridSkeleton from "./WidgetGridSkeleton";

const WebChatsListSkeleton = () => {
  return (
    <div>
      <Skeleton className="h-10 w-32 mb-8" /> {/* Page Title */}
      <WidgetGridSkeleton title="All Chats" count={8} />
    </div>
  );
};

export default WebChatsListSkeleton;
