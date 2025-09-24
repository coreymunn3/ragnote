"use client";

import { ChatMessage, ChatSession } from "@/lib/types/chatTypes";

interface WebChatPageContentProps {
  chatSession: ChatSession;
  chatMessages?: ChatMessage[];
}

const WebChatPageContent = ({
  chatSession,
  chatMessages,
}: WebChatPageContentProps) => {
  // chat panel here?
  return (
    <div>
      <p>Hello, Chat Page</p>
      <p>{chatSession.title}</p>
    </div>
  );
};

export default WebChatPageContent;
