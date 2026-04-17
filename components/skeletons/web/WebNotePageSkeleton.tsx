import ToolbarSkeleton from "./WebToolbarSkeleton";
import EditorSkeleton from "./EditorSkeleton";

const WebNotePageSkeleton = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] pt-2">
      {/* Toolbar */}
      <div className="flex-shrink-0">
        <ToolbarSkeleton variant="note" />
      </div>

      {/* Editor Skeleton */}
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
        <EditorSkeleton />
      </div>
    </div>
  );
};

export default WebNotePageSkeleton;
