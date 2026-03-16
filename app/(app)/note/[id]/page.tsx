import MobileNotePageContent from "@/app/(app)/components/Note/MobileNotePageContent";
import WebNotePageContent from "@/app/(app)/components/Note/WebNotePageContent";
import ResponsivePage from "@/components/ResponsivePage";

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params before using
  const { id: noteId } = await params;

  // Render each view component - data fetching now happens client-side
  const mobileView = <MobileNotePageContent noteId={noteId} />;
  const webView = <WebNotePageContent noteId={noteId} />;

  return <ResponsivePage mobileView={mobileView} webView={webView} />;
}
