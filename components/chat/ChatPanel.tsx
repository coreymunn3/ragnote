"use client";
import { HistoryIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Sheet, SheetContent } from "../ui/sheet";
import { TypographyLead, TypographyMuted } from "../ui/typography";
import ChatInput from "./ChatInput";
import { cn } from "@/lib/utils";

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
  // MUTATION to send a chat message
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={cn(
          "p-2 pb-6",
          isMobile
            ? "h-[80vh] rounded-t-lg flex flex-col"
            : "w-[500px] flex flex-col",
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
            {/* Conversation messages will go here */}
            <div className="flex items-center justify-center h-full text-center text-muted-foreground">
              <div>
                <TypographyLead>Start a conversation</TypographyLead>
                <TypographyMuted>
                  Ask questions about your note using the input below
                </TypographyMuted>
              </div>
            </div>
          </div>

          {/* Bottom area - message input */}
          <div className="flex-shrink-0">
            <ChatInput
              onSend={(message) => {
                // TODO: Handle sending message to AI service
                console.log("Sending message:", message);
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
