"use client";
import { ChatMessage, ChatSession } from "@/lib/types/chatTypes";
import ChatMessages from "@/components/chat/ChatMessages";
import ChatInput from "@/components/chat/ChatInput";

interface ToolbarProps {
  chatSession: ChatSession;
  isLoading: boolean;
}

interface BaseChatPageContentProps {
  chatSession: ChatSession;
  chatMessages: ChatMessage[];
  pendingUserMessage: string;
  isLoading: boolean;
  isPro: boolean;
  onSendChat: (message: string) => void;
  renderToolbar?: (props: ToolbarProps) => React.ReactNode;
}

const BaseChatPageContent = ({
  chatSession,
  chatMessages,
  pendingUserMessage,
  isLoading,
  isPro,
  onSendChat,
  renderToolbar,
}: BaseChatPageContentProps) => {
  /** Prepare Toolbar Props */
  const toolbarProps: ToolbarProps = {
    chatSession,
    isLoading,
  };

  return (
    // the height class here is to account for the Mobile header in the root layout
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Toolbar (only for web view) */}
      {renderToolbar && (
        <div className="flex-shrink-0">{renderToolbar(toolbarProps)}</div>
      )}
      {/* Chat Messages */}
      <div className="flex-1 overflow-hidden">
        <ChatMessages
          messages={chatMessages}
          pendingUserMessage={pendingUserMessage}
        />
      </div>
      {/* Chat Input */}
      <div className="flex-shrink-0 p-4">
        <ChatInput
          onSend={onSendChat}
          disabled={!isPro}
          tooltipMessage={
            !isPro ? "Pro subscription required to send message" : ""
          }
        />
      </div>
    </div>
  );
};
export default BaseChatPageContent;
