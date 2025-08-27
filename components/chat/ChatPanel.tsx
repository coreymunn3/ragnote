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
import { useState, useEffect } from "react";
import { ChatDisplayMessage, ChatScope } from "@/lib/types/chatTypes";
import ChatMessages from "./ChatMessages";
import { useNoteVersionContext } from "@/contexts/NoteVersionContext";
import VersionBadge from "../VersionBadge";
import { useChatWithNote } from "@/hooks/chat/useChatWithNote";
import {
  toDisplayMessage,
  toDisplayMessageArray,
  createOptimisticUserMessage,
  createThinkingMessage,
  isTemporaryMessage,
} from "@/lib/utils/chatMessageHelpers";
import { useGetChatHistoryForScope } from "@/hooks/chat/useGetChatHistoryForScope";
import ChatHistory from "./ChatHistory";
import { useGetChatMessagesForSessionScope } from "@/hooks/chat/useGetChatMessagesForSessionScope";

interface ChatPanelProps {
  open: boolean;
  onOpenChange: () => void;
  title: string;
  isMobile?: boolean;
  scope: ChatScope;
  scopeId?: string;
}

const ChatPanel = ({
  open,
  onOpenChange,
  title,
  isMobile = false,
  scope,
  scopeId,
}: ChatPanelProps) => {
  // GET the chat session history for this note version
  // MUTATION to send a chat message (this create a new session & will hold the conversation)
  const [chatSessionId, setChatSessionId] = useState<string | undefined>();
  const [conversation, setConversation] = useState<ChatDisplayMessage[]>([]);
  const [historyExpanded, setHistoryExpanded] = useState<boolean>(false);
  // get values from context
  const { noteVersions, note, loading } = useNoteVersionContext();
  // the user must chat with only the most recently published version
  const mostRecentPublishedVersion = noteVersions.filter(
    (version) => version.is_published
  )[0];

  // Hook for getting chat history
  const chatHistoryForScope = useGetChatHistoryForScope(scope, scopeId, {
    enabled: open,
  });

  // Hook for getting chat messages for the current session
  const chatConversation = useGetChatMessagesForSessionScope(
    chatSessionId || "",
    scope,
    scopeId,
    {
      enabled: open && !!chatSessionId,
    }
  );

  // Populate conversation state from API data when historical session is loaded
  useEffect(() => {
    if (chatConversation.data && chatSessionId) {
      // Convert API data to DisplayMessages and set as conversation
      const historicalMessages = toDisplayMessageArray(chatConversation.data);
      setConversation(historicalMessages);
    }
  }, [chatConversation.data, chatSessionId]);

  /**
   * Change the selected chat session ID
   * called when the user clicks a chat history item to view an older conversation
   * @param sessionId the session ID
   */
  const handleSelectChatSession = (sessionId: string) => {
    // Clear current conversation - it will be populated by useEffect when API data loads
    setConversation([]);
    // Set the chat session to the selected one
    setChatSessionId(sessionId);
    // close history
    setHistoryExpanded(false);
  };

  // Hook for sending chat messages
  const sendChatMutation = useChatWithNote({
    onSuccess: (response) => {
      setChatSessionId(response.session.id);

      // Remove thinking message and add real AI response
      setConversation((prev) => {
        // Filter out temporary messages (optimistic user message and thinking message)
        const withoutTempMessages = prev.filter(
          (msg) => !isTemporaryMessage(msg)
        );

        // Add the real user and AI messages from the API
        return [
          ...withoutTempMessages,
          toDisplayMessage(response.userMessage),
          toDisplayMessage(response.aiMessage),
        ];
      });
    },
    onError: (error) => {
      // Remove optimistic and thinking messages on error
      setConversation((prev) => prev.filter((msg) => !isTemporaryMessage(msg)));
    },
  });

  /**
   * Called by the input. creates optimistic messages, then sends the chat
   * @param message the users message
   * @returns
   */
  const handleSendChat = (message: string) => {
    if (!note?.id) return;
    // Immediately add optimistic user message
    const optimisticUserMessage = createOptimisticUserMessage(message);
    const thinkingMessage = createThinkingMessage();
    setConversation((prev) => [
      ...prev,
      optimisticUserMessage,
      thinkingMessage,
    ]);
    // Send message using the API
    sendChatMutation.mutate({
      noteId: note.id,
      message,
      sessionId: chatSessionId,
    });
  };

  // expands or collapses the history section
  const handleToggleHistoryExpanded = () => {
    setHistoryExpanded((prev) => !prev);
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
            <div className="flex flex-row space-x-2 items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <TypographyLead className="font-semibold text-foreground">
                    {title} Chat
                  </TypographyLead>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    You are chatting with the most recently published version of
                    this note
                  </p>
                </TooltipContent>
              </Tooltip>

              {!!mostRecentPublishedVersion && (
                <VersionBadge version={mostRecentPublishedVersion} />
              )}
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

          {/* Middle area - space for conversation bubbles */}
          <div className="flex-1 overflow-y-scroll p-3 ">
            {!mostRecentPublishedVersion && (
              <div className="flex items-center justify-center h-full text-center">
                <TypographyMuted>
                  Publish this note to begin chatting!
                </TypographyMuted>
              </div>
            )}
            {!!mostRecentPublishedVersion && conversation.length === 0 && (
              <div className="flex items-center justify-center h-full text-center">
                <TypographyMuted>
                  Ask questions about your note using the input below
                </TypographyMuted>
              </div>
            )}
            {conversation.length > 0 && (
              <div>
                <ChatMessages messages={conversation} />
              </div>
            )}
          </div>

          {/* Bottom area - message input */}
          <div className="flex-shrink-0 p-2">
            <ChatInput
              onSend={handleSendChat}
              showSuggestions={conversation.length === 0 ? true : false}
              disabled={
                !mostRecentPublishedVersion || sendChatMutation.isPending
              }
              placeholder={`Ask about ${title}...`}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
export default ChatPanel;
