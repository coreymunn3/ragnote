"use client";

import { ChatDisplayMessage } from "@/lib/types/chatTypes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@clerk/nextjs";
import { DateTime } from "luxon";
import Markdown from "react-markdown";
import { isThinkingMessage } from "@/lib/utils/chatMessageHelpers";

interface ChatMessageProps {
  message: ChatDisplayMessage;
}

/**
 * This thinking indicator is a way of showing the AI is thinking about the response.
 * It is 3 dots slowly moving up and down
 */
const ThinkingIndicator = () => {
  return (
    <div className="flex items-center space-x-1">
      <span className="text-sm opacity-70">I'm thinking</span>
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
      </div>
    </div>
  );
};

const ChatMessage = ({ message }: ChatMessageProps) => {
  const { user, isLoaded } = useUser();
  const isUser = message.sender_type === "USER";
  const userAvatarSrc = user?.imageUrl;

  return (
    <div className={`chat ${isUser ? "chat-end" : "chat-start"}`}>
      {/* The user or AI avatar */}
      <div className="chat-image avatar">
        {isUser ? (
          <Avatar>
            <AvatarImage src={userAvatarSrc} alt="U" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        ) : (
          <Avatar>
            <AvatarFallback>🤖</AvatarFallback>
          </Avatar>
        )}
      </div>
      {/* Message metadata */}
      <div className="chat-header">
        <span className="text-xs opacity-50">{isUser ? "You" : "AI"}</span>
        <time className="text-xs opacity-50 ml-1">
          {DateTime.fromISO(message.created_at.toString()).toLocaleString(
            DateTime.TIME_SIMPLE
          )}
        </time>
      </div>
      {/* Message content */}
      <div
        className={`chat-bubble rounded-lg ${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {isThinkingMessage(message) ? (
          <ThinkingIndicator />
        ) : (
          <Markdown>{message.content}</Markdown>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
