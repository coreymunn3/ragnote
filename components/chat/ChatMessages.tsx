"use client";

import { useEffect, useRef, useMemo } from "react";
import {
  ChatMessage as ChatMessageType,
  ChatDisplayMessage,
} from "@/lib/types/chatTypes";
import { AnimatedListItem } from "@/components/animations";
import ChatMessage from "./ChatMessage";
import {
  toDisplayMessageArray,
  createOptimisticUserMessage,
  createThinkingMessage,
} from "@/lib/utils/chatMessageHelpers";
import { TypographyMuted } from "@/components/ui/typography";
import { ScrollableContainer } from "../ui/scrollable-container";

interface ChatMessagesProps {
  messages: ChatMessageType[];
  pendingUserMessage?: string;
}

const ChatMessages = ({ messages, pendingUserMessage }: ChatMessagesProps) => {
  // Convert raw ChatMessage[] to ChatDisplayMessage[] and add optimistic messages
  const displayMessages = useMemo(() => {
    const historicalMessages = toDisplayMessageArray(messages);
    const optimisticMessages: ChatDisplayMessage[] = [];

    // Add pending user message if present
    if (pendingUserMessage) {
      optimisticMessages.push(createOptimisticUserMessage(pendingUserMessage));
      // Always show thinking when there's a pending message
      optimisticMessages.push(createThinkingMessage());
    }
    return [...historicalMessages, ...optimisticMessages];
  }, [messages, pendingUserMessage]);

  // an element used to determine the last message so that we can auto-scroll to it
  const messagesEnd = useRef<null | HTMLDivElement>(null);
  // function that scrolls the window to the last message
  const scrollToBottom = () => {
    if (messagesEnd.current) {
      messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // scroll to the bottom when we add more messages
  useEffect(() => {
    scrollToBottom();
  }, [displayMessages]);

  // Handle empty state
  if (displayMessages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <TypographyMuted>
          Ask questions about your note using the input below
        </TypographyMuted>
      </div>
    );
  }

  return (
    <ScrollableContainer
      className="h-full"
      direction="vertical"
      showTopFade={true}
      showBottomFade={true}
      showLeftFade={false}
      showRightFade={false}
    >
      <div className="flex flex-col space-y-2">
        {/* Messages in the conversation */}
        {displayMessages.map((message, index) => (
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
    </ScrollableContainer>
  );
};

export default ChatMessages;
