"use client";
import { useParams } from "next/navigation";
import RichTextEditor from "@/components/RichTextEditor";
import type { BlockNoteEditor } from "@blocknote/core";
import { useSaveNoteVersionContent } from "@/hooks/note/useSaveNoteVersionContent";
import { useNoteVersionContext } from "@/contexts/NoteVersionContext";
import { Skeleton } from "@/components/ui/skeleton";
import { debounce } from "lodash";

const WebNotePageContent = () => {
  const params: { id: string } = useParams();
  const { id: noteId } = params;
  const { selectedVersionId, selectedVersion, isLoading, error } =
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

  // Show error state if there's an error loading data
  if (error) {
    return (
      <div className="pt-8">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-red-800 dark:text-red-200">
            Error loading note versions: {error.message}
          </p>
        </div>
      </div>
    );
  }

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="pt-10">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Show message if no version is selected
  if (!selectedVersion || !selectedVersionId) {
    return (
      <div className="pt-8">
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <p className="text-yellow-800 dark:text-yellow-200">
            No version selected
          </p>
        </div>
      </div>
    );
  }

  // Only render the editor when we have a valid selected version
  // This prevents the double skeleton issue
  return (
    <div className="pt-8">
      <RichTextEditor
        key={selectedVersionId} // Force re-render when version changes
        initialContent={selectedVersion.rich_text_content}
        onChange={handleEditorChange}
        readOnly={selectedVersion.is_published}
      />
    </div>
  );
};
export default WebNotePageContent;
