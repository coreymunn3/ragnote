import ResponsivePage from "@/components/ResponsivePage";
import MobileNotePageSkeleton from "./mobile/MobileNotePageSkeleton";
import WebNotePageSkeleton from "./web/WebNotePageSkeleton";

const NotePageSkeleton = () => {
  return (
    <ResponsivePage
      mobileView={<MobileNotePageSkeleton />}
      webView={<WebNotePageSkeleton />}
    />
  );
};

export default NotePageSkeleton;
