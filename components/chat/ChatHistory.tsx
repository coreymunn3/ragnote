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
    <Button
      className="flex items-center gap-2 hover:bg-sidebar ring-0 outline-none focus:ring-0"
      variant={"ghost"}
      onClick={onToggle}
    >
      {isLoading ? (
        <Loader2Icon className="h-4 w-4 animate-spin" />
      ) : (
        <HistoryIcon
          className={`h-4 w-4 ${isError ? "text-destructive" : ""}`}
        />
      )}
      <TypographySmall>{`Recent Conversations (${sessionCount})`}</TypographySmall>
      {!isError && (
        <div>
          <ChevronRight
            className={
              "w-4 h-4 transition-all duration-200 " +
              (isOpen ? "rotate-90" : "") +
              (isLoading ? "text-muted" : "")
            }
          />
        </div>
      )}
    </Button>
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
    <div
      className={`max-h-[40%] w-full transition-all duration-200 overflow-hidden overflow-y-scroll ${
        isOpen
          ? "bg-sidebar rounded-lg text-foreground"
          : "text-muted-foreground"
      }`}
    >
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
            <div className="pl-2">
              {sessionHistory.map((session, index) => (
                <AnimatedListItem
                  key={session.id}
                  index={index}
                  animation="fadeInRight"
                >
                  <ChatHistoryItem session={session} />
                </AnimatedListItem>
              ))}
            </div>
          )}
        </div>
      </AnimatedExpandable>
    </div>
  );
};
export default ChatHistory;
