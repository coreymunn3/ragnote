import { ChatMessage, ChatSession } from "@/lib/types/chatTypes";

interface MobileChatPageContentProps {
  chatSession: ChatSession;
  chatMessages?: ChatMessage[];
}

const MobileChatPageContent = ({
  chatSession,
  chatMessages,
}: MobileChatPageContentProps) => {
  return <div>MobileChatPageContent</div>;
};

export default MobileChatPageContent;
