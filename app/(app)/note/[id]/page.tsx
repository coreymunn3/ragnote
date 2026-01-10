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

  // getDbUser already calls auth.protect() - no need for manual auth check
  const dbUser = await getDbUser();

  // Server-side data fetching
  const noteService = new NoteService();
  let note, noteVersions;
  try {
    [note, noteVersions] = await Promise.all([
      noteService.getNoteById({ noteId, userId: dbUser.id }),
      noteService.getNoteVersions({ noteId, userId: dbUser.id }),
    ]);
  } catch (error) {
    console.error(error);
    notFound();
  }

  const mobileView = (
    <MobileNotePageContent note={note} noteVersions={noteVersions} />
  );
  const webView = (
    <WebNotePageContent note={note} noteVersions={noteVersions} />
  );

  return <ResponsivePage mobileView={mobileView} webView={webView} />;
}
