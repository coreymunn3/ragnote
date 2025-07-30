"use client";
import { HistoryIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { TypographyLead, TypographyMuted } from "../ui/typography";
import ChatInput from "./ChatInput";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { SimpleChat } from "@/lib/types/chatTypes";
import ChatMessages from "./ChatMessages";

interface ChatPanelProps {
  open: boolean;
  onOpenChange: () => void;
  title: string;
  isMobile?: boolean;
}

const ChatPanel = ({
  open,
  onOpenChange,
  title,
  isMobile = false,
}: ChatPanelProps) => {
  // GET the chat session history for this note version
  // MUTATION to send a chat message (this create a new session & will hold the conversation)
  const [chatSessionId, setChatSessionId] = useState<string | undefined>();
  const [conversation, setConversation] = useState<SimpleChat[]>([]);

  console.log(conversation);

  const handleSendChat = (input: string) => {
    // send the human message
    const newChat: SimpleChat = {
      sender_type: "USER",
      content: input,
      created_at: new Date(),
    };
    setConversation((prev) => [...prev, newChat]);
    // mock the AI response, after a short delay
    const simpleResponse: SimpleChat = {
      sender_type: "AI",
      content: "This is the AI Response!",
      created_at: new Date(),
    };
    setTimeout(() => {
      setConversation((prev) => [...prev, simpleResponse]);
    }, 300);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetHeader className="hidden">
        <SheetTitle>Hidden Title</SheetTitle>
      </SheetHeader>
      <SheetContent
        className={cn(
          "p-2 pb-8",
          isMobile
            ? "h-[80vh] rounded-t-lg flex flex-col"
            : "min-w-[500px] flex flex-col",
          "[&>button]:hidden"
        )}
        side={isMobile ? "bottom" : "right"}
      >
        <div className="flex-1 flex flex-col">
          {/* Top Banner - title and history */}
          <div className="p-1 flex justify-between items-center border-b border-sidebar-border">
            <TypographyLead className="font-semibold text-foreground">
              {title} Chat
            </TypographyLead>
            <Button variant={"ghost"}>
              <HistoryIcon className="h-4 w-4" />
            </Button>
          </div>
          {/* Middle area - space for conversation bubbles */}
          <div className="flex-1 overflow-y-auto p-3">
            {conversation.length > 0 ? (
              <div>
                <ChatMessages messages={conversation} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <TypographyMuted>
                  Ask questions about your note using the input below
                </TypographyMuted>
              </div>
            )}
          </div>

          {/* Bottom area - message input */}
          <div className="flex-shrink-0">
            <ChatInput
              onSend={(message) => {
                // TODO: Handle sending message to AI service
                console.log("Sending message:", message);
                handleSendChat(message);
              }}
              placeholder={`Ask about ${title}...`}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
export default ChatPanel;
