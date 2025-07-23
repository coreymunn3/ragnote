"use client";
import { useParams } from "next/navigation";
import RichTextEditor from "@/components/RichTextEditor";
import type { BlockNoteEditor } from "@blocknote/core";
import { useSaveNoteVersionContent } from "@/hooks/note/useSaveNoteVersionContent";
import { useNoteVersionContext } from "@/contexts/NoteVersionContext";
import { Skeleton } from "@/components/ui/skeleton";
import { debounce } from "lodash";
import MessageAlert from "@/components/MessageAlert";

const WebNotePageContent = () => {
  const params: { id: string } = useParams();
  const { id: noteId } = params;
  const { selectedVersionId, selectedVersion, note, loading, error } =
    useNoteVersionContext();

  const saveNoteVersionContent = useSaveNoteVersionContent();

  // TO DO - save editor content to a draft after debouncing for 3 seconds
  const handleEditorChange = debounce((editor: BlockNoteEditor) => {
    // mutation to save the note version
    if (selectedVersionId) {
      saveNoteVersionContent.mutate({
        noteId,
        versionId: selectedVersionId,
        richTextContent: editor.document,
      });
    }
  }, 1000);

  // Only show loading if we don't have the essential data (note)
  // With initial data, this should almost never happen
  const shouldShowLoading = loading.noteLoading && !note;

  if (shouldShowLoading) {
    return (
      <div className="pt-10">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // If there's an error in any of our queries, lets show an error alert
  if (error.noteError || error.versionsError) {
    return (
      <div className="pt-8">
        <MessageAlert
          variant="error"
          title="Error Loading Note"
          description={`Error loading note versions: ${error.noteError?.message || error.versionsError?.message}`}
        />
      </div>
    );
  }

  // Show message if no note is loaded
  // With initial data, this should rarely happen since server-side fetching handles not found
  if (!note) {
    return (
      <div className="pt-8">
        <MessageAlert
          variant="error"
          title="Error Loading Note"
          description="Note ID did not resolve to a note."
        />
      </div>
    );
  }

  // Show message if no version is selected
  // though we should be redirected to notFound before ever seeing this
  if (!selectedVersion || !selectedVersionId) {
    return (
      <div className="pt-8">
        <MessageAlert
          variant="warning"
          title="No Version Selected"
          description="No version is currently selected for this note."
        />
      </div>
    );
  }

  return (
    <div className="pt-8">
      <RichTextEditor
        key={selectedVersionId} // Force re-render when version changes
        initialContent={selectedVersion.rich_text_content}
        onChange={handleEditorChange}
        readOnly={selectedVersion.is_published || note.is_deleted}
      />
    </div>
  );
};
export default WebNotePageContent;
