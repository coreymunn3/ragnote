"use client";

import { ChatMessage, ChatSession } from "@/lib/types/chatTypes";

interface WebChatPageContentProps {
  chatSessionId: string;
  chatSession: ChatSession;
  chatMessages?: ChatMessage[];
}

const WebChatPageContent = ({
  chatSessionId,
  chatSession,
  chatMessages,
}: WebChatPageContentProps) => {
  // re-fetch chat session and messages
  return (
    <div>
      <p>Hello, Chat Page</p>
      <p>{chatSession.title}</p>
      {/* Chat Toolbar (TO DO) */}
      {/* Chat Messages */}
      {/* Chat Input */}
    </div>
  );
};

export default WebChatPageContent;
