import WebChatsContent from "../components/Chats/WebChatsContent";
import MobileChatsContent from "../components/Chats/MobileChatsContent";
import ResponsivePage from "@/components/ResponsivePage";
import { getDbUser } from "@/lib/getDbUser";
import { ChatService } from "@/services/chat/chatService";
import { ChatSession } from "@/lib/types/chatTypes";

export default async function ChatsPage() {
  const chatService = new ChatService();
  // get the database user
  const dbUser = await getDbUser();

  // get the chat sessions
  let chatSessions: ChatSession[] = [];
  try {
    chatSessions = await chatService.getChatSessionsForUser({
      userId: dbUser.id,
    });
  } catch (error) {
    console.error(error);
  }

  // Render each view component
  const mobileView = <MobileChatsContent chatSessions={chatSessions} />;
  const webView = <WebChatsContent chatSessions={chatSessions} />;

  return <ResponsivePage mobileView={mobileView} webView={webView} />;
}
