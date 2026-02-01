import WebDashboardContent from "../components/Dashboard/WebDashboardContent";
import MobileDashboardContent from "../components/Dashboard/MobileDashboardContent";
import ResponsivePage from "@/components/ResponsivePage";
import { NoteService } from "@/services/note/noteService";
import { getDbUser } from "@/lib/getDbUser";
import { Note } from "@/lib/types/noteTypes";
import { ChatService } from "@/services/chat/chatService";
import { ChatSession } from "@/lib/types/chatTypes";
import { FolderWithItems } from "@/lib/types/folderTypes";
import { FolderService } from "@/services/folder/folderService";

export default async function Dashboard() {
  const noteService = new NoteService();
  const chatService = new ChatService();
  const folderService = new FolderService();

  const dbUser = await getDbUser();

  const [notes, chatSessions, userFolders] = await Promise.all([
    // get the users notes - initial data for the web dashboard page
    noteService.getAllNotesForUser(dbUser.id).catch((error) => {
      console.error(error);
      return [];
    }),
    // get the users chat sessions - initial data for the web dashboard page
    chatService
      .getChatSessionsForUser({
        userId: dbUser.id,
      })
      .catch((error) => {
        console.error(error);
        return [];
      }),
    // get the users folders - initial data for the mobile dashboard page
    folderService.getUserCreatedFolders(dbUser.id).catch((error) => {
      console.error(error);
      return [];
    }),
  ]);

  // Render each view component
  const mobileView = <MobileDashboardContent userFolders={userFolders} />;
  const webView = (
    <WebDashboardContent notes={notes} chatSessions={chatSessions} />
  );

  return <ResponsivePage mobileView={mobileView} webView={webView} />;
}
