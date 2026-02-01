import ResponsivePage from "@/components/ResponsivePage";
import { getDbUser } from "@/lib/getDbUser";
import { ChatMessage } from "@/lib/types/chatTypes";
import { ChatService } from "@/services/chat/chatService";
import { notFound } from "next/navigation";
import MobileChatPageContent from "../../components/Chat/MobileChatPageContent";
import WebChatPageContent from "../../components/Chat/WebChatPageContent";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const chatService = new ChatService();
  const { id: chatSessionId } = await params;
  const dbUser = await getDbUser();

  const [chatSession, chatMessages] = await Promise.all([
    // get the chat session
    chatService
      .getChatSession({
        userId: dbUser.id,
        sessionId: chatSessionId,
      })
      .catch((error) => {
        console.error(error);
        return null;
      }),
    // get the chat messages for this session
    chatService
      .getChatMessagesForSession({
        sessionId: chatSessionId,
        userId: dbUser.id,
      })
      .catch((error) => {
        console.error(
          `Unable to get chat messages for session ${chatSessionId}`
        );
        console.error(error);
        return [];
      }),
  ]);

  if (!chatSession) {
    notFound();
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
