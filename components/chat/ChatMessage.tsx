"use client";

import { PrismaChatMessage } from "@/lib/types/chatTypes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@clerk/nextjs";
import { DateTime } from "luxon";

interface ChatMessageProps {
  message: PrismaChatMessage;
}

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
        {message.content}
      </div>
    </div>
  );
};

export default ChatMessage;
