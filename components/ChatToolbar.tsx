"use client";
import { useParams } from "next/navigation";
import EditableField from "./EditableField";
import { ChatSession } from "@/lib/types/chatTypes";
import { Skeleton } from "./ui/skeleton";
import OptionsMenu from "./OptionsMenu";
import { Trash2Icon } from "lucide-react";
import { TypographyMuted } from "./ui/typography";
import { DateTime } from "luxon";

interface ChatToolbarProps {
  chatSession: ChatSession;
  isLoading: boolean;
}

const ChatToolbar = ({ chatSession, isLoading }: ChatToolbarProps) => {
  const { id } = useParams();

  const handleSaveTitle = (newTitle: string) => {
    console.log(newTitle);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2">
      {/* left side - title */}
      <div className="flex items-center">
        <EditableField
          value={chatSession.title || "Chat Session..."}
          variant="bold"
          onSave={handleSaveTitle}
        />
      </div>
      {/* right side - last activity, controls */}
      <div className="flex items-center space-x-2">
        <TypographyMuted>
          {DateTime.fromISO(chatSession.updated_at).toRelative()}
        </TypographyMuted>
        <OptionsMenu
          options={[
            {
              label: "Delete",
              icon: <Trash2Icon className="h-4 w-4" />,
              onClick: () => console.log("delete"),
            },
          ]}
        />
      </div>
    </div>
  );
};
export default ChatToolbar;
