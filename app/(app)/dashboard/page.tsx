import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import WebDashboardContent from "../components/Dashboard/WebDashboardContent";
import MobileDashboardContent from "../components/Dashboard/MobileDashboardContent";
import ResponsiveView from "@/components/ResponsiveView";
import { NoteService } from "@/services/note/noteService";
import { getDbUser } from "@/lib/getDbUser";
import { Note } from "@/lib/types/noteTypes";

export default async function Dashboard() {
  const { userId } = await auth();
  const noteService = new NoteService();

  // Protect this page from non-logged-in users
  if (!userId) {
    redirect("/");
  }

  // get the database user
  const dbUser = await getDbUser();
  // get the users notes - initial data for dashboard page
  let notes: Note[] = [];
  try {
    notes = await noteService.getAllNotesForUser(dbUser.id);
  } catch (error) {
    console.error(error);
  }

  // Render each view component
  const mobileView = <MobileDashboardContent notes={notes} />;
  const webView = <WebDashboardContent notes={notes} />;

  return <ResponsiveView mobileView={mobileView} webView={webView} />;
}
