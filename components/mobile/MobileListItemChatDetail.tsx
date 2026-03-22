"use client";

import { ChatSession } from "@/lib/types/chatTypes";
import ScopeBadge from "../ScopeBadge";
import { ArchiveRestore, Trash2Icon } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { useUpdateChat } from "@/hooks/chat/useUpdateChat";
import ConfirmationDialog from "../dialogs/ConfirmationDialog";

interface MobileListItemChatDetailProps {
  chatSession: ChatSession;
}

const MobileListItemChatDetail = ({
  chatSession,
}: MobileListItemChatDetailProps) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const updateChatMutation = useUpdateChat();

  const handleDeleteNote = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteOpen(true);
  };

  const handleRecover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    updateChatMutation.mutate({
      sessionId: chatSession.id,
      action: "recover",
    });
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <ScopeBadge chatScope={chatSession.chat_scope.scope} />
        {chatSession.is_deleted ? (
          <Button variant={"ghost"} onClick={handleRecover}>
            <ArchiveRestore className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant={"ghost"} onClick={handleDeleteNote}>
            <Trash2Icon className="h-4 w-4" />
          </Button>
        )}
      </div>
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
export default MobileListItemChatDetail;
