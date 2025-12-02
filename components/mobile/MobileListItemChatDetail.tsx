"use client";

import { ChatSession } from "@/lib/types/chatTypes";
import { TypographyP } from "../ui/typography";

interface MobileListItemChatDetailProps {
  chat: ChatSession;
}

const MobileListItemChatDetail = ({ chat }: MobileListItemChatDetailProps) => {
  return (
    <>
      <TypographyP>{`(${chat.messages_count})`}</TypographyP>
    </>
  );
};
export default MobileListItemChatDetail;
