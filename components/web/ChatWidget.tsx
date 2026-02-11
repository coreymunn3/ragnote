import { ChatSession } from "@/lib/types/chatTypes";
import { TypographyMuted, TypographySmall } from "../ui/typography";
import { MessageSquareIcon, Trash2Icon } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { DateTime } from "luxon";
import Link from "next/link";
import ScopeBadge from "../ScopeBadge";
import { useState } from "react";
import { Button } from "../ui/button";
import ConfirmationDialog from "../dialogs/ConfirmationDialog";
import { useUpdateChat } from "@/hooks/chat/useUpdateChat";
import { useOfflineGuard } from "@/hooks/useOfflineGuard";

interface ChatWidgetProps {
  chatSession: ChatSession;
}

const ChatWidget = ({ chatSession }: ChatWidgetProps) => {
  // construct the chat URL
  const chatUrl = `/chat/${chatSession.id}`;
  const [deleteOpen, setDeleteOpen] = useState(false);

  const updateChatMutation = useUpdateChat();
  const { isOnline } = useOfflineGuard();

  const handleDeleteNote = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteOpen(true);
  };

  return (
    <>
      <Link href={chatUrl} className="block w-full h-full">
        <Card
          variant="dense"
          className="acursor-pointer hover:shadow-md hover:text-primary hover:border hover:border-primary transition-all duration-200"
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              {/* Header Left - Title */}
              <CardTitle className="text-base font-semibold line-clamp-1 overflow-ellipsis">
                {chatSession.title}
              </CardTitle>
              {/* Header right - actions/options */}
              <div className="flex items-center justify-center space-x-2">
                <ScopeBadge chatScope={chatSession.chat_scope.scope} />
                <Button
                  variant={"ghost"}
                  onClick={handleDeleteNote}
                  disabled={!isOnline}
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <TypographyMuted className="line-clamp-2 overflow-ellipsis h-10">
              {chatSession.preview}
            </TypographyMuted>
          </CardContent>

          <CardFooter>
            <div className="flex justify-between w-full">
              {/* number of messages in this session */}
              <div className="flex items-center text-muted-foreground">
                <MessageSquareIcon className="h-4 w-4 mr-1.5" />
                <TypographySmall>
                  {chatSession.messages_count} messages
                </TypographySmall>
              </div>
              {/* last updated */}
              <div className="flex items-center text-muted-foreground">
                <TypographySmall>
                  {DateTime.fromISO(chatSession.updated_at).toRelative()}
                </TypographySmall>
              </div>
            </div>
          </CardFooter>
        </Card>
      </Link>

      {/* Delete note confirmation dialog */}
      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={"Are you sure you want to delete?"}
        description="You will be able to recover this Chat later, for a while."
        confirmText="Delete"
        confirmVariant="destructive"
        onConfirm={() => {
          updateChatMutation.mutate({
            sessionId: chatSession.id,
            action: "delete",
          });
        }}
        isLoading={updateChatMutation.isPending}
      />
    </>
  );
};

export default ChatWidget;
