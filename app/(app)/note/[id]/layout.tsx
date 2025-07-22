import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import WebNoteLayout from "@/app/(app)/components/layouts/web/note/layout";
import MobileNoteLayout from "@/app/(app)/components/layouts/mobile/note/layout";
import ResponsiveLayout from "@/components/ResponsiveLayout";
import { NoteVersionProvider } from "@/contexts/NoteVersionContext";
import { NoteService } from "@/services/note/noteService";
import { getDbUser } from "@/lib/getDbUser";

export default async function LayoutSwitch({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  const noteService = new NoteService();

  // Await params before using
  const { id: noteId } = await params;

  // Protect this page from non-logged-in users
  if (!userId) {
    redirect("/");
  }

  // Get the database user
  const dbUser = await getDbUser();

  // Server-side data fetching
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

  return (
    <NoteVersionProvider initialNote={note} initialNoteVersions={noteVersions}>
      <ResponsiveLayout
        MobileLayout={MobileNoteLayout}
        WebLayout={WebNoteLayout}
      >
        {children}
      </ResponsiveLayout>
    </NoteVersionProvider>
  );
}
