import { ChatMessage, ChatSession } from "@/lib/types/chatTypes";

interface MobileChatPageContentProps {
  chatSessionId: string;
  chatSession: ChatSession;
  chatMessages: ChatMessage[];
}

const MobileChatPageContent = ({
  chatSessionId,
  chatSession,
  chatMessages,
}: MobileChatPageContentProps) => {
  return <div>MobileChatPageContent</div>;
};

export default MobileChatPageContent;
