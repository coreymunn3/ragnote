import ResponsivePage from "@/components/ResponsivePage";
import MobileNotePageSkeleton from "./MobileNotePageSkeleton";
import WebNotePageSkeleton from "./WebNotePageSkeleton";

const NotePageSkeleton = () => {
  return (
    <ResponsivePage
      mobileView={<MobileNotePageSkeleton />}
      webView={<WebNotePageSkeleton />}
    />
  );
};

export default NotePageSkeleton;
