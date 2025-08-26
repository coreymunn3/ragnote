"use client";

import { ChatSession } from "@/lib/types/chatTypes";
import { TypographyMuted, TypographySmall } from "../ui/typography";
import { Button } from "../ui/button";

interface ChatHistoryItemProps {
  session: ChatSession;
}

const ChatHistoryItem = ({ session }: ChatHistoryItemProps) => {
  return (
    <Button
      variant={"ghost"}
      className="flex flex-row items-center justify-between px-4 py-0 mx-2 w-[98%]"
    >
      <div className="flex gap-4 items-center flex-1 min-w-0">
        <TypographySmall className="flex-shrink-0">
          {session.title}
        </TypographySmall>
        <TypographyMuted className="truncate">
          {session.preview}
        </TypographyMuted>
      </div>
    </Button>
  );
};
export default ChatHistoryItem;
