import { Skeleton } from "../ui/skeleton";

const NotePageSkeleton = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-shrink-0">
        <Skeleton className="h-16 w-full" />
      </div>
      <div className="flex-1 overflow-hidden pt-10">
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
};

export default NotePageSkeleton;
