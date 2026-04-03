"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { TypographyLead, TypographyMuted } from "../ui/typography";
import ChatInput from "./ChatInput";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { ChatScope } from "@/lib/types/chatTypes";
import ChatMessages from "./ChatMessages";
import VersionBadge from "../VersionBadge";
import { useChat } from "@/hooks/chat/useChat";
import { useGetChatHistoryForScope } from "@/hooks/chat/useGetChatHistoryForScope";
import ChatHistory from "./ChatHistory";
import { useGetChatMessagesForSession } from "@/hooks/chat/useGetChatMessagesForSession";
import { Button } from "../ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Note, PrismaNoteVersion } from "@/lib/types/noteTypes";
import { MessageCirclePlusIcon } from "lucide-react";

interface ChatPanelProps {
  open: boolean;
  onOpenChange: () => void;
  title: string;
  isMobile?: boolean;
  scope: ChatScope;
  scopeId?: string;
  note?: Note;
  noteVersions?: PrismaNoteVersion[];
  initialMessage?: string;
}

const ChatPanel = ({
  open,
  onOpenChange,
  title,
  isMobile = false,
  scope,
  scopeId,
  note,
  noteVersions,
  initialMessage,
}: ChatPanelProps) => {
  const queryClient = useQueryClient();
  // GET the chat session history for this note version
  // MUTATION to send a chat message (this create a new session & will hold the conversation)
  const [chatSessionId, setChatSessionId] = useState<string | undefined>();
  const [pendingUserMessage, setPendingUserMessage] = useState<string>(
    initialMessage || "",
  );
  const [historyExpanded, setHistoryExpanded] = useState<boolean>(false);
  const hasAutoSentInitialMessage = useRef(false);

  // the user must chat with only the most recently published version
  const mostRecentPublishedVersion = noteVersions?.filter(
    (version) => version.is_published,
  )[0];

  // Hook for getting chat history
  const chatHistoryForScope = useGetChatHistoryForScope(scope, scopeId, {
    enabled: open,
  });

  // Hook for getting chat messages for the current session
  const chatConversation = useGetChatMessagesForSession(chatSessionId || "", {
    enabled: open && !!chatSessionId,
  });

  /**
   * Change the selected chat session ID
   * called when the user clicks a chat history item to view an older conversation
   * @param sessionId the session ID
   */
  const handleSelectChatSession = (sessionId: string) => {
    // Set the chat session to the selected one
    setChatSessionId(sessionId);
    // close history
    setHistoryExpanded(false);
  };

  // Hook for sending chat messages
  const sendChatMutation = useChat({
    onSuccess: (response) => {
      setChatSessionId(response.session.id);

      // Invalidate the chat history query
      queryClient.invalidateQueries({
        queryKey: ["chatHistory", scope, scopeId],
      });
      // Invalidate the chat conversation query
      queryClient.invalidateQueries({
        queryKey: ["chat-session", response.session.id, "messages"],
      });
      // Invalidate the folders query to update sidebar
      queryClient.invalidateQueries({
        queryKey: ["folders"],
      });

      // Don't clear pending message immediately - let it clear after messages load
      // This prevents a flash of empty state
      setTimeout(() => {
        setPendingUserMessage("");
      }, 500);
    },
    onError: (error) => {
      // Remove optimistic and thinking messages on error
      setPendingUserMessage("");
    },
  });

  /**
   * Called by the input. creates optimistic messages, then sends the chat
   * @param message the users message
   * @returns
   */
  const handleSendChat = (message: string) => {
    // For folder/global scope, scopeId might be undefined
    const effectiveScopeId = scope === "note" ? note?.id : scopeId;

    // Set optimistic message state - ChatMessages will automatically show thinking
    setPendingUserMessage(message);
    // Send message using the API
    sendChatMutation.mutate({
      scope,
      scopeId: effectiveScopeId,
      message,
      sessionId: chatSessionId,
    });
  };

  // expands or collapses the history section
  const handleToggleHistoryExpanded = () => {
    setHistoryExpanded((prev) => !prev);
  };

  /**
   * Called by New Chat button - clear the existing conversation and session
   */
  const handleBeginNewChat = () => {
    setHistoryExpanded(false);
    setChatSessionId(undefined);
    setPendingUserMessage("");
    hasAutoSentInitialMessage.current = false;
  };

  /**
   * Auto-send initial message when panel opens with an initialMessage prop
   * This is used when opening the chat panel from the CommandBar
   */
  useEffect(() => {
    if (open && initialMessage && !hasAutoSentInitialMessage.current) {
      hasAutoSentInitialMessage.current = true;
      setPendingUserMessage(initialMessage);
      setTimeout(() => {
        handleSendChat(initialMessage);
      }, 10);
    }
  }, [open, initialMessage]);

  /**
   * Reset the auto-send flag when panel closes
   */
  useEffect(() => {
    if (!open) {
      hasAutoSentInitialMessage.current = false;
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetHeader className="hidden">
        <SheetTitle>Hidden Title</SheetTitle>
      </SheetHeader>
      <SheetContent
        className={cn(
          "p-1",
          isMobile
            ? "h-[80vh] rounded-t-lg flex flex-col"
            : "min-w-[500px] flex flex-col",
          "[&>button]:hidden",
        )}
        side={isMobile ? "bottom" : "right"}
      >
        <div
          className={`flex-1 flex flex-col space-y-2 px-2 ${isMobile ? "h-full" : "max-h-screen"}`}
        >
          {/* Top Banner - title and history */}
          <div className="flex justify-between items-center mt-2">
            {/* left side: title and active version */}
            <div className="flex flex-row justify-between items-center w-full">
              <div className="flex flex-row space-x-2 items-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TypographyLead className="font-semibold text-foreground">
                        {title} Chat
                      </TypographyLead>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {scope === "note"
                          ? "You are chatting with this note"
                          : scope === "folder"
                            ? "You are chatting with all notes in this folder"
                            : "You are chatting with all your notes"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {scope === "note" && !!mostRecentPublishedVersion && (
                  <VersionBadge
                    version={mostRecentPublishedVersion}
                    context="version"
                  />
                )}
              </div>
              <div>
                <Button variant={"ghost"} onClick={handleBeginNewChat}>
                  <MessageCirclePlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          {/* Second Banner - Chat History */}
          <ChatHistory
            isOpen={historyExpanded}
            onOpenChange={handleToggleHistoryExpanded}
            onChatHistorySelect={handleSelectChatSession}
            sessionHistory={chatHistoryForScope.data || []}
            isLoading={chatHistoryForScope.isLoading}
            isError={chatHistoryForScope.isError}
          />

          {/* Middle area - space for conversation bubbles with top fade */}
          <div className="flex-1 min-h-0 p-3">
            <ChatMessages
              messages={chatConversation.data || []}
              pendingUserMessage={pendingUserMessage}
            />
          </div>

          {/* Bottom area - message input */}
          <div className="flex-shrink-0 p-2">
            <ChatInput
              onSend={handleSendChat}
              showSuggestions={false} // disable for now - need to make these dynamic first
              disabled={sendChatMutation.isPending}
              placeholder={
                scope === "note"
                  ? `Ask about ${title}...`
                  : scope === "folder"
                    ? `Ask about notes in ${title}...`
                    : "Ask about all your notes..."
              }
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
export default ChatPanel;
