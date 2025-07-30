"use client";

import { SimpleChat } from "@/lib/types/chatTypes";
import { AnimatedListItem } from "@/components/animations";
import ChatMessage from "./ChatMessage";

interface ChatMessagesProps {
  messages: SimpleChat[];
}

const ChatMessages = ({ messages }: ChatMessagesProps) => {
  return (
    <div className="flex flex-col space-y-2 overflow-y-auto">
      {messages.map((message, index) => (
        <AnimatedListItem
          key={`${message.sender_type}-${message.created_at.getTime()}-${index}`}
          index={index}
          animation={
            message.sender_type === "USER" ? "fadeInRight" : "fadeInLeft"
          }
          delay={0.05}
        >
          <ChatMessage message={message} />
        </AnimatedListItem>
      ))}
    </div>
  );
};

export default ChatMessages;
