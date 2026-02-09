import { notFound } from "next/navigation";
import MobileNotePageContent from "@/app/(app)/components/Note/MobileNotePageContent";
import WebNotePageContent from "@/app/(app)/components/Note/WebNotePageContent";
import ResponsivePage from "@/components/ResponsivePage";
import { NoteService } from "@/services/note/noteService";
import { getDbUser } from "@/lib/getDbUser";

export default async function NotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params before using
  const { id: noteId } = await params;

  // Server-side data fetching
  const noteService = new NoteService();
  let note = null;
  let noteVersions = null;

  try {
    const dbUser = await getDbUser();
    [note, noteVersions] = await Promise.all([
      noteService.getNoteById({ noteId, userId: dbUser.id }),
      noteService.getNoteVersions({ noteId, userId: dbUser.id }),
    ]);
  } catch (error) {
    // If we're offline and can't fetch, we'll return null for placeholderData
    // and let the client-side query handle it (potentially using cache)
    console.error("Failed to fetch note server-side:", error);
    // Don't notFound() here, as we want to try client-side fetch/cache
  }

  const mobileView = (
    <MobileNotePageContent
      noteId={noteId}
      initialNote={note}
      initialNoteVersions={noteVersions || []}
    />
  );
  const webView = (
    <WebNotePageContent
      noteId={noteId}
      initialNote={note}
      initialNoteVersions={noteVersions || []}
    />
  );

  return <ResponsivePage mobileView={mobileView} webView={webView} />;
}
