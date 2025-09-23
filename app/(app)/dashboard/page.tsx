import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import WebDashboardContent from "../components/Dashboard/WebDashboardContent";
import MobileDashboardContent from "../components/Dashboard/MobileDashboardContent";
import ResponsivePage from "@/components/ResponsivePage";
import { NoteService } from "@/services/note/noteService";
import { getDbUser } from "@/lib/getDbUser";
import { Note } from "@/lib/types/noteTypes";
import { ChatService } from "@/services/chat/chatService";
import { ChatSession } from "@/lib/types/chatTypes";

export default async function Dashboard() {
  const { userId } = await auth();
  const noteService = new NoteService();
  const chatService = new ChatService();

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
  // get the users chat sessions - initial data for the dashboard page
  let chatSessions: ChatSession[] = [];
  try {
    chatSessions = await chatService.getChatSessionsForUser({
      userId: dbUser.id,
    });
  } catch (error) {
    console.error(error);
  }

  // Render each view component
  const mobileView = (
    <MobileDashboardContent notes={notes} chatSessions={chatSessions} />
  );
  const webView = (
    <WebDashboardContent notes={notes} chatSessions={chatSessions} />
  );

  return <ResponsivePage mobileView={mobileView} webView={webView} />;
}
