import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { debounce } from "lodash";
import type { BlockNoteEditor } from "@blocknote/core";
import { useSaveNoteVersionContent } from "./useSaveNoteVersionContent";
import { SaveStatusType } from "@/components/SaveStatus";
import { useQueryClient } from "@tanstack/react-query";

interface UseNoteAutoSaveOptions {
  noteId: string;
  versionId: string | null;
}

export interface UseNoteAutoSaveReturn {
  saveStatus: SaveStatusType;
  handleEditorChange: (editor: BlockNoteEditor) => void;
}

/**
 * Auto-saves note content with debouncing and proper cleanup.
 *
 * Features:
 * - Debounces saves (1s delay after last keystroke)
 * - Cancels pending saves when switching versions/notes
 * - Cancels in-flight API requests on unmount/version change
 * - Derives save status to avoid race conditions
 */
export function useNoteAutoSave({
  noteId,
  versionId,
}: UseNoteAutoSaveOptions): UseNoteAutoSaveReturn {
  const queryClient = useQueryClient();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const saveNoteVersionContent = useSaveNoteVersionContent({
    onSuccess: () => setHasUnsavedChanges(false),
  });

  // Keep mutate function stable across re-renders
  // (TanStack Query creates new object with updated state on each render)
  const mutateRef = useRef(saveNoteVersionContent.mutate);
  mutateRef.current = saveNoteVersionContent.mutate;

  // Create stable debounced save function
  // Only recreates when versionId or noteId changes
  const debouncedSave = useMemo(
    () =>
      debounce((editor: BlockNoteEditor) => {
        if (versionId) {
          mutateRef.current({
            noteId,
            versionId,
            richTextContent: editor.document,
          });
        }
      }, 1000),
    [versionId, noteId],
  );

  // Cleanup: Cancel pending saves and in-flight requests
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
      if (versionId) {
        queryClient.cancelQueries({
          queryKey: ["saveNoteVersion", noteId, versionId],
        });
      }
    };
  }, [debouncedSave, versionId, noteId, queryClient]);

  // Reset state when version changes
  useEffect(() => {
    setHasUnsavedChanges(false);
  }, [versionId]);

  // Editor change handler
  const handleEditorChange = useCallback(
    (editor: BlockNoteEditor) => {
      setHasUnsavedChanges(true);
      debouncedSave(editor);
    },
    [debouncedSave],
  );

  // Derive save status from mutation state
  const saveStatus: SaveStatusType = useMemo(() => {
    if (saveNoteVersionContent.isError) return "error";
    if (saveNoteVersionContent.isPending) return "saving";
    if (hasUnsavedChanges) return "unsaved";
    if (saveNoteVersionContent.isSuccess) return "saved";
    return "idle";
  }, [saveNoteVersionContent, hasUnsavedChanges]);

  return { saveStatus, handleEditorChange };
}
