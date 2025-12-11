import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
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
  const { userId } = await auth();

  // Await params before using
  const { id: noteId } = await params;

  // Protect this page from non-logged-in users
  if (!userId) {
    redirect("/");
  }

  // Get the database user
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
