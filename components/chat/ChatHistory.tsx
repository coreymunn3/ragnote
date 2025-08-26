"use client";
import { TypographyMuted, TypographySmall } from "../ui/typography";
import { Button } from "../ui/button";
import { ChatSession } from "@/lib/types/chatTypes";
import { ChevronRight, HistoryIcon, Loader2Icon } from "lucide-react";
import { AnimatedExpandable, AnimatedListItem } from "@/components/animations";
import ChatHistoryItem from "./ChatHistoryItem";

// Small header component for the chat history section
const ChatHistoryHeader = ({
  isLoading,
  sessionCount,
  isOpen,
  onToggle,
  isError,
}: {
  isLoading: boolean;
  sessionCount: number;
  isOpen: boolean;
  onToggle: () => void;
  isError: boolean;
}) => {
  return (
    <div className="flex items-center gap-2">
      <HistoryIcon className={`h-4 w-4 ${isError ? "text-destructive" : ""}`} />
      {isLoading ? (
        <div className="flex items-center gap-1">
          <TypographySmall>Recent Conversations</TypographySmall>
          <Loader2Icon className="animate-spin h-4 w-4" />
        </div>
      ) : (
        <>
          <TypographySmall>{`Recent Conversations (${sessionCount})`}</TypographySmall>
          {!isError && (
            <Button variant={"ghost"} onClick={onToggle}>
              <ChevronRight
                className={
                  "w-4 h-4 transition-all duration-200 " +
                  (isOpen ? "rotate-90" : "")
                }
              />
            </Button>
          )}
        </>
      )}
    </div>
  );
};

interface ChatHistoryProps {
  isOpen: boolean;
  onOpenChange: () => void;
  sessionHistory: ChatSession[];
  isLoading?: boolean;
  isError?: boolean | null;
}

const ChatHistory = ({
  isOpen,
  onOpenChange,
  sessionHistory = [],
  isLoading = false,
  isError = false,
}: ChatHistoryProps) => {
  return (
    <div className={`max-h-[80%] p-1 gap-1 border-b border-sidebar-border`}>
      {/* top - 'recent conversations (3)' and toggle */}
      <div className="flex items-center">
        <ChatHistoryHeader
          isLoading={isLoading}
          sessionCount={sessionHistory.length}
          isOpen={isOpen}
          onToggle={onOpenChange}
          isError={!!isError}
        />
      </div>
      {/* body - chat history items */}
      <AnimatedExpandable isOpen={isOpen}>
        <div className="space-y-1">
          {/* isError State */}
          {isError && (
            <div className="p-2">
              <TypographyMuted className="text-destructive">
                error loading chat history
              </TypographyMuted>
            </div>
          )}
          {/* No Session History */}
          {!isLoading && !isError && sessionHistory.length === 0 && (
            <div className="p-2">
              <TypographyMuted>No previous conversations</TypographyMuted>
            </div>
          )}
          {/* Session History Items */}
          {!isLoading && !isError && sessionHistory.length > 0 && (
            <>
              {sessionHistory.map((session, index) => (
                <AnimatedListItem
                  key={session.id}
                  index={index}
                  animation="fadeInRight"
                >
                  <ChatHistoryItem session={session} />
                </AnimatedListItem>
              ))}
            </>
          )}
        </div>
      </AnimatedExpandable>
    </div>
  );
};
export default ChatHistory;
