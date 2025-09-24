import ResponsivePage from "@/components/ResponsivePage";
import { getDbUser } from "@/lib/getDbUser";
import { ChatMessage } from "@/lib/types/chatTypes";
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

  // get the chat messages for this session
  let chatMessages: ChatMessage[] = [];
  if (chatSession) {
    try {
      chatMessages = await chatService.getChatMessagesForSession({
        sessionId: chatSessionId,
        userId: dbUser.id,
      });
    } catch (error) {
      console.error(`Unable to get chat messages for session ${chatSessionId}`);
      console.error(error);
      // chatMessages remains [] on error
    }
  }

  const mobileView = (
    <MobileChatPageContent
      chatSessionId={chatSessionId}
      chatSession={chatSession}
      chatMessages={chatMessages}
    />
  );
  const webView = (
    <WebChatPageContent
      chatSessionId={chatSessionId}
      chatSession={chatSession}
      chatMessages={chatMessages}
    />
  );

  return <ResponsivePage mobileView={mobileView} webView={webView} />;
}
