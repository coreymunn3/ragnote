"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { TypographyLead, TypographyMuted } from "../ui/typography";
import ChatInput from "./ChatInput";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useState } from "react";
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

interface ChatPanelProps {
  open: boolean;
  onOpenChange: () => void;
  title: string;
  isMobile?: boolean;
  scope: ChatScope;
  scopeId?: string;
  note?: Note;
  noteVersions?: PrismaNoteVersion[];
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
}: ChatPanelProps) => {
  const queryClient = useQueryClient();
  // GET the chat session history for this note version
  // MUTATION to send a chat message (this create a new session & will hold the conversation)
  const [chatSessionId, setChatSessionId] = useState<string | undefined>();
  const [pendingUserMessage, setPendingUserMessage] = useState<string>("");
  const [historyExpanded, setHistoryExpanded] = useState<boolean>(false);
  // the user must chat with only the most recently published version
  const mostRecentPublishedVersion = noteVersions?.filter(
    (version) => version.is_published
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

      // Clear optimistic messages since real messages are now in the API data
      setPendingUserMessage("");
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
    if (!note?.id) return;
    // Set optimistic message state - ChatMessages will automatically show thinking
    setPendingUserMessage(message);
    // Send message using the API
    sendChatMutation.mutate({
      scope,
      scopeId: note.id,
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
  };

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
          "[&>button]:hidden"
        )}
        side={isMobile ? "bottom" : "right"}
      >
        <div className="flex-1 flex flex-col space-y-2 max-h-screen px-2">
          {/* Top Banner - title and history */}
          <div className="flex justify-between items-center mt-2">
            {/* left side: title and active version */}
            <div className="flex flex-row justify-between items-center w-full">
              <div className="flex flex-row space-x-2 items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <TypographyLead className="font-semibold text-foreground">
                      {title} Chat
                    </TypographyLead>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      You are chatting with the most recently published version
                      of this note
                    </p>
                  </TooltipContent>
                </Tooltip>
                {!!mostRecentPublishedVersion && (
                  <VersionBadge version={mostRecentPublishedVersion} />
                )}
              </div>
              <div>
                <Button variant={"outline"} onClick={handleBeginNewChat}>
                  New Chat
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
            {!mostRecentPublishedVersion ? (
              <div className="flex items-center justify-center h-full text-center">
                <TypographyMuted>
                  Publish this note to begin chatting!
                </TypographyMuted>
              </div>
            ) : (
              <ChatMessages
                messages={chatConversation.data || []}
                pendingUserMessage={pendingUserMessage}
              />
            )}
          </div>

          {/* Bottom area - message input */}
          <div className="flex-shrink-0 p-2">
            <ChatInput
              onSend={handleSendChat}
              showSuggestions={false} // disable for now - need to make these dynamic first
              disabled={
                !mostRecentPublishedVersion || sendChatMutation.isPending
              }
              tooltipMessage="At least 1 published version of this note required to send message."
              placeholder={`Ask about ${title}...`}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
export default ChatPanel;
