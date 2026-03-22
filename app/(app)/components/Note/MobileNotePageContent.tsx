"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import BaseNotePageContent from "./BaseNotePageContent";
import { useMobileHeader } from "@/contexts/MobileHeaderContext";
import { useGetNote } from "@/hooks/note/useGetNote";
import { useGetNoteVersions } from "@/hooks/note/useGetNoteVersions";
import { useUpdateNote } from "@/hooks/note/useUpdateNote";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import NoteToolbar from "@/components/mobile/NoteToolbar";
import { toast } from "sonner";
import MobilePageTitle from "@/components/mobile/MobilePageTitle";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import MobileBackButton from "@/components/mobile/MobileBackButton";
import MobileNotePageSkeleton from "@/components/skeletons/MobileNotePageSkeleton";

interface MobileNotePageContentProps {
  noteId: string;
}

const MobileNotePageContent = ({ noteId }: MobileNotePageContentProps) => {
  const router = useRouter();
  const { setHeaderConfig, resetHeaderConfig } = useMobileHeader();

  // State management
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    null,
  );
  // dialog state management
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Fetch note data client-side
  const {
    data: noteData,
    isLoading: noteLoading,
    error: noteError,
  } = useGetNote(noteId);

  // Fetch note versions client-side
  const {
    data: noteVersions,
    isLoading: versionsLoading,
    error: versionsError,
  } = useGetNoteVersions(noteId);

  // Set initial selected version when note data loads
  useEffect(() => {
    if (noteData?.current_version?.id && !selectedVersionId) {
      setSelectedVersionId(noteData.current_version.id);
    }
  }, [noteData, selectedVersionId]);

  // Compute selected version
  const selectedVersion = useMemo(() => {
    if (selectedVersionId && noteVersions) {
      return noteVersions.find((v) => v.id === selectedVersionId) || null;
    }
    return null;
  }, [selectedVersionId, noteVersions]);

  // Mutations
  const updateNoteMutation = useUpdateNote();

  // Handlers
  const handleToggleChat = () => {
    setChatOpen((prev) => !prev);
  };

  // Handlers for options menu
  const handleDeleteNote = () => {
    setDeleteOpen(true);
  };

  // Set mobile header configuration
  useEffect(() => {
    if (noteData) {
      setHeaderConfig({
        leftContent: (
          <>
            <MobileBackButton
              onClick={() => router.push(`/folder/${noteData.folder_id}`)}
            />
            <MobilePageTitle title={noteData.title} />
          </>
        ),
        rightContent: (
          <>
            <Button variant={"ghost"} onClick={handleDeleteNote}>
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </>
        ),
      });

      return () => {
        resetHeaderConfig();
      };
    }
  }, [noteData, router, setHeaderConfig, resetHeaderConfig]);

  const isLoading = noteLoading || versionsLoading;
  const error =
    (!noteData && noteError) || (!noteVersions && versionsError)
      ? noteError || versionsError
      : null;

  if ((noteLoading || versionsLoading) && !noteData) {
    return <MobileNotePageSkeleton />;
  }

  if (!noteData) {
    return <MobileNotePageSkeleton />;
  }

  return (
    <>
      <BaseNotePageContent
        isMobile={true}
        note={noteData}
        noteVersions={noteVersions || []}
        selectedVersionId={selectedVersionId}
        setSelectedVersionId={setSelectedVersionId}
        selectedVersion={selectedVersion}
        chatOpen={chatOpen}
        handleToggleChat={handleToggleChat}
        isLoading={isLoading}
        error={error}
        renderToolbar={(props) => (
          <NoteToolbar
            note={props.note}
            selectedVersion={props.selectedVersion}
            selectedVersionId={props.selectedVersionId}
            setSelectedVersionId={props.setSelectedVersionId}
            handleToggleChat={props.handleToggleChat}
            noteVersions={props.noteVersions}
            saveStatus={props.saveStatus}
          />
        )}
      />

      {/* Delete confirmation */}
      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={"Are you sure you want to delete?"}
        description="You will be able to recover this Note later, for a while."
        confirmText="Delete"
        confirmLoadingText="Deleting..."
        confirmVariant="destructive"
        onConfirm={() => {
          if (noteData) {
            updateNoteMutation.mutate(
              {
                noteId: noteData.id,
                folderId: noteData.folder_id,
                action: "delete",
              },
              {
                onSuccess: () => {
                  // route user back to the folder AFTER mutation completes
                  router.push(`/folder/${noteData.folder_id}`);
                },
              },
            );
          } else {
            toast.error("Unable to Delete");
          }
        }}
        isLoading={updateNoteMutation.isPending}
      />
    </>
  );
};

export default MobileNotePageContent;
