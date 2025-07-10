"use client";
import { useParams } from "next/navigation";
import RichTextEditor from "@/components/RichTextEditor";
import type { BlockNoteEditor } from "@blocknote/core";
import { useSaveNoteVersionContent } from "@/hooks/note/useSaveNoteVersionContent";
import { useNoteVersion } from "@/contexts/NoteVersionContext";
import { debounce } from "lodash";

const WebNotePageContent = () => {
  const params: { id: string } = useParams();
  const { id: noteId } = params;
  const { selectedVersionId, note, isLoading } = useNoteVersion();
  const saveNoteVersionContent = useSaveNoteVersionContent();

  // TO DO - save editor content to a draft after debouncing for 3 seconds
  const handleEditorChange = debounce((editor: BlockNoteEditor) => {
    console.log("onChange:", JSON.stringify(editor.document));
    // mutation to save the note version
    if (selectedVersionId) {
      saveNoteVersionContent.mutate({
        noteId,
        versionId: selectedVersionId,
        richTextContent: editor.document,
      });
    }
  }, 3000);

  if (isLoading || !note || !selectedVersionId) {
    return (
      <div className="pt-8">
        <div className="h-64 bg-gray-100 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="pt-8">
      <RichTextEditor onChange={handleEditorChange} />
    </div>
  );
};
export default WebNotePageContent;
