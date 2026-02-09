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

  let chatSession = null;
  let chatMessages: ChatMessage[] = [];

  try {
    const dbUser = await getDbUser();
    [chatSession, chatMessages] = await Promise.all([
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
            `Unable to get chat messages for session ${chatSessionId}`,
          );
          console.error(error);
          return [];
        }),
    ]);
  } catch (error) {
    console.error("Failed to fetch chat server-side:", error);
  }

  // If we fetched successfully but got null (e.g. 404), we might want to let client decide
  // or handle it. For now we pass null to client which will show skeleton/error

  const mobileView = (
    <MobileChatPageContent
      chatSessionId={chatSessionId}
      initialChatSession={chatSession}
      initialChatMessages={chatMessages}
    />
  );
  const webView = (
    <WebChatPageContent
      chatSessionId={chatSessionId}
      initialChatSession={chatSession}
      initialChatMessages={chatMessages}
    />
  );

  return <ResponsivePage mobileView={mobileView} webView={webView} />;
}
