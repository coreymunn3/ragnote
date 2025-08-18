"use client";

import { useEffect, useRef } from "react";
import { ChatDisplayMessage } from "@/lib/types/chatTypes";
import { AnimatedListItem } from "@/components/animations";
import ChatMessage from "./ChatMessage";

interface ChatMessagesProps {
  messages: ChatDisplayMessage[];
}

const ChatMessages = ({ messages }: ChatMessagesProps) => {
  const messagesEnd = useRef<null | HTMLDivElement>(null);
  console.log(messagesEnd);

  const scrollToBottom = () => {
    if (messagesEnd.current) {
      messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // scroll to the bottom when we add more messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col space-y-2 overflow-y-auto">
      {/* Messages in the conversation */}
      {messages.map((message, index) => (
        <AnimatedListItem
          key={message.id}
          index={index}
          animation={
            message.sender_type === "USER" ? "fadeInRight" : "fadeInLeft"
          }
          delay={0.05}
        >
          <ChatMessage message={message} />
        </AnimatedListItem>
      ))}
      {/* Messages end - used to scroll into view */}
      <div ref={messagesEnd}></div>
    </div>
  );
};

export default ChatMessages;
