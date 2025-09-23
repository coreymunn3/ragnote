import ResponsivePage from "@/components/ResponsivePage";
import { getDbUser } from "@/lib/getDbUser";
import { ChatService } from "@/services/chat/chatService";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import MobileChatPageContent from "../../components/Chat/MobileChatPageContent";
import WebChatPageContent from "../../components/Chat/WebChatPageContent";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  const chatService = new ChatService();
  const { id: chatSessionId } = await params;
  // Protect this page from non-logged-in users
  if (!userId) {
    redirect("/");
  }
  // get the database user
  const dbUser = await getDbUser();
  // get the chat session
  let chatSession;
  try {
    chatSession = await chatService.getChatSession({
      userId: dbUser.id,
      sessionId: chatSessionId,
    });
  } catch (error) {
    console.error(error);
    notFound();
  }

  const mobileView = <MobileChatPageContent chatSession={chatSession} />;
  const webView = <WebChatPageContent chatSession={chatSession} />;

  return <ResponsivePage mobileView={mobileView} webView={webView} />;
}
