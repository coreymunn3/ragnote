"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Note, PrismaNoteVersion } from "@/lib/types/noteTypes";
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

interface MobileNotePageContentProps {
  note: Note;
  noteVersions: PrismaNoteVersion[];
}

const MobileNotePageContent = ({
  note: initialNote,
  noteVersions: initialNoteVersions,
}: MobileNotePageContentProps) => {
  const router = useRouter();
  const { setHeaderConfig, resetHeaderConfig } = useMobileHeader();

  // State management
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    initialNote?.current_version?.id || null
  );
  // dialog state management
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Re-fetch note data with initial data
  const {
    data: note,
    isLoading: noteLoading,
    error: noteError,
  } = useGetNote(initialNote.id, {
    enabled: !!initialNote.id,
    initialData: initialNote,
    staleTime: 0,
    refetchOnMount: true,
  });

  // Re-fetch note versions with initial data
  const {
    data: noteVersions,
    isLoading: versionsLoading,
    error: versionsError,
  } = useGetNoteVersions(initialNote.id, {
    enabled: !!initialNote.id,
    initialData: initialNoteVersions,
    staleTime: 0,
    refetchOnMount: true,
  });

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
    if (note) {
      setHeaderConfig({
        leftContent: (
          <>
            <MobileBackButton
              onClick={() => router.push(`/folder/${note.folder_id}`)}
            />
            <MobilePageTitle title={note.title} />
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
  }, [note, router, setHeaderConfig, resetHeaderConfig]);

  const isLoading = noteLoading || versionsLoading;
  const error = noteError || versionsError;

  return (
    <>
      <BaseNotePageContent
        isMobile={true}
        note={note || initialNote}
        noteVersions={noteVersions || initialNoteVersions}
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
          if (note) {
            updateNoteMutation.mutate({
              noteId: note.id,
              folderId: note.folder_id,
              action: "delete",
            });
            router.push(`/folder/${note.folder_id}`);
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
