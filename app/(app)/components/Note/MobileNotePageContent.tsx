"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Note, PrismaNoteVersion } from "@/lib/types/noteTypes";
import BaseNotePageContent from "./BaseNotePageContent";
import { useMobileHeader } from "@/contexts/MobileHeaderContext";
import { useGetNote } from "@/hooks/note/useGetNote";
import { useGetNoteVersions } from "@/hooks/note/useGetNoteVersions";
import { useUpdateNote } from "@/hooks/note/useUpdateNote";
import { usePublishNoteVersion } from "@/hooks/note/usePublishNoteVersion";
import { useUserSubscription } from "@/hooks/user/useUserSubscription";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, BookCheckIcon, MessageCircleIcon } from "lucide-react";
import EditableField from "@/components/EditableField";
import VersionSelector from "@/components/VersionSelector";
import ProButton from "@/components/ProButton";
import { toast } from "sonner";

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
  const { isPro } = useUserSubscription();

  // State management
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    initialNote?.current_version?.id || null
  );
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
  const publishNoteVersionMutation = usePublishNoteVersion({
    onSuccess: (data) => {
      const { nextVersion } = data;
      setSelectedVersionId(nextVersion.id);
    },
  });

  // Handlers
  const handleToggleChat = () => {
    setChatOpen((prev) => !prev);
  };

  const handleSaveTitle = (newTitle: string) => {
    if (note) {
      updateNoteMutation.mutate({
        noteId: note.id,
        action: "update_title",
        title: newTitle,
      });
    } else {
      toast.error("Unable to Update Title");
    }
  };

  const handlePublishNote = () => {
    if (note && selectedVersionId) {
      publishNoteVersionMutation.mutate({
        versionId: selectedVersionId,
        noteId: note.id,
      });
    } else {
      toast.error("Unable to Publish");
    }
  };

  // Set mobile header configuration
  useEffect(() => {
    if (note) {
      setHeaderConfig({
        leftContent: (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(`/folder/${note.folder_id}`)}
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            <EditableField
              value={note.title}
              variant="bold"
              onSave={handleSaveTitle}
            />
          </>
        ),
        rightContent: selectedVersion ? (
          <>
            {isPro ? (
              <VersionSelector
                selectedVersion={selectedVersion}
                noteVersions={noteVersions || []}
                onSelect={(v) => setSelectedVersionId(v.id)}
              />
            ) : (
              <ProButton
                label={`v${selectedVersion.version_number}`}
                className={`px-3 ${
                  selectedVersion.is_published
                    ? "bg-primary text-primary-foreground shadow hover:bg-primary/80"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              />
            )}
            <ProButton
              variant="ghost"
              icon={<MessageCircleIcon className="h-4 w-4" />}
              onClick={handleToggleChat}
            />
            <ProButton
              icon={<BookCheckIcon className="h-4 w-4" />}
              variant="ghost"
              className="text-primary"
              onClick={handlePublishNote}
              isLoading={publishNoteVersionMutation.isPending}
              disabled={!selectedVersion || selectedVersion?.is_published}
            />
          </>
        ) : null,
      });

      return () => {
        resetHeaderConfig();
      };
    }
  }, [
    note,
    selectedVersion,
    selectedVersionId,
    noteVersions,
    isPro,
    router,
    setHeaderConfig,
    resetHeaderConfig,
    publishNoteVersionMutation.isPending,
  ]);

  const isLoading = noteLoading || versionsLoading;
  const error = noteError || versionsError;

  return (
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
    />
  );
};

export default MobileNotePageContent;
