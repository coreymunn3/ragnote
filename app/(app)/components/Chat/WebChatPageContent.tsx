"use client";

import { ChatSession } from "@/lib/types/chatTypes";

interface WebChatPageContentProps {
  chatSession: ChatSession;
}

const WebChatPageContent = ({ chatSession }: WebChatPageContentProps) => {
  // chat panel here?
  return (
    <div>
      <p>Hello, Chat Page</p>
      <p>{chatSession.title}</p>
    </div>
  );
};

export default WebChatPageContent;
