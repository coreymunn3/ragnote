import { useState, useEffect, useMemo, useRef } from "react";
import { debounce, type DebouncedFunc } from "lodash";
import type { BlockNoteEditor } from "@blocknote/core";
import { useSaveNoteVersionContent } from "./useSaveNoteVersionContent";
import { SaveStatusType } from "@/components/SaveStatus";

interface UseNoteAutoSaveOptions {
  noteId: string;
  versionId: string | null;
}

/**
 * Return type for the useNoteAutoSave hook
 */
export interface UseNoteAutoSaveReturn {
  /** Current save status derived from mutation state and local changes */
  saveStatus: SaveStatusType;
  /** Handler function to call when the editor content changes */
  handleEditorChange: (editor: BlockNoteEditor) => void;
}

/**
 * Custom hook for handling auto-save functionality in the note editor.
 *
 * This hook manages the complex interaction between user input, debounced saves,
 * and save status display. It solves several critical issues related to React
 * re-rendering and debounce function stability.
 *
 * @param noteId - The ID of the note being edited
 * @param versionId - The ID of the current note version (null if no version selected)
 * @returns An object containing the current save status and editor change handler
 */
export function useNoteAutoSave({
  noteId,
  versionId,
}: UseNoteAutoSaveOptions): UseNoteAutoSaveReturn {
  // ============================================================================
  // LOCAL STATE: Tracks whether there are unsaved changes
  // ============================================================================
  // This flag is set to true immediately when the user types, and reset to false
  // when the save completes successfully. This allows us to show "Unsaved changes"
  // instantly without waiting for the debounce timer.
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ============================================================================
  // TANSTACK QUERY MUTATION: Handles the actual save API call
  // ============================================================================
  // This mutation provides isPending, isSuccess, and isError states that we use
  // to derive the save status. The onSuccess callback resets hasUnsavedChanges.
  const saveNoteVersionContent = useSaveNoteVersionContent({
    onSuccess: () => setHasUnsavedChanges(false),
  });

  // ============================================================================
  // USEREF: Maintains a stable reference to the mutate function
  // ============================================================================
  // CRITICAL BUG FIX #2: The saveNoteVersionContent object changes on every render
  // because TanStack Query creates a new object with updated state properties
  // (isPending, isSuccess, isError, etc.) each time the component re-renders.
  //
  // BUG SCENARIO WITHOUT USEREF:
  // 1. User types in editor → triggers re-render
  // 2. saveNoteVersionContent becomes a new object (with updated state)
  // 3. If we included saveNoteVersionContent in useMemo dependencies, it would
  //    detect a change and recreate the debounced function
  // 4. The OLD debounced function's timer is still running from the previous keystroke
  // 5. Both the OLD timer and NEW debounced function would fire
  // 6. Result: Multiple API requests, UI flickering between "Saving..." and "All changes saved"
  //
  // SOLUTION:
  // Store only the mutate function (not the entire object) in a ref. Refs don't
  // trigger re-renders when updated, and we manually keep it in sync with the
  // latest mutate function. This allows us to remove saveNoteVersionContent from
  // useMemo dependencies while still calling the correct mutate function.
  const mutateRef = useRef(saveNoteVersionContent.mutate);
  mutateRef.current = saveNoteVersionContent.mutate;

  // ============================================================================
  // USEMEMO: Creates a stable, debounced editor change handler
  // ============================================================================
  // CRITICAL BUG FIX #1: Without memoization, this entire function (including the
  // debounced save) would be recreated on every single render.
  //
  // BUG SCENARIO WITHOUT USEMEMO:
  // 1. User types "H" → handleEditorChange created with debounce timer (Timer A)
  // 2. Component re-renders (due to state change)
  // 3. NEW handleEditorChange created with NEW debounce instance (Timer B)
  // 4. User types "e" → Timer B starts
  // 5. Timer A completes → sends save request for "H"
  // 6. Timer B completes → sends save request for "He"
  // 7. Result: Multiple API requests, unnecessary server load, UI flickering
  //
  // SOLUTION:
  // Wrap in useMemo with dependencies [versionId, noteId]. The function is only
  // recreated when these values change (e.g., user switches to a different note
  // version). Within the same editing session, the debounced function remains
  // stable, so only ONE timer is active at a time.
  //
  // We store the debounced function in a ref so we can access its cancel method
  // in the cleanup effect below. Using DebouncedFunc type from lodash gives us
  // proper TypeScript support for the cancel() method without needing 'as any'.
  const debouncedSaveRef =
    useRef<DebouncedFunc<(editor: BlockNoteEditor) => void>>();

  const handleEditorChange = useMemo(() => {
    // Create the debounced save function that waits 1000ms after the last
    // keystroke before sending the save request to the API
    const debouncedSave = debounce((editor: BlockNoteEditor) => {
      if (versionId) {
        // Use mutateRef.current instead of saveNoteVersionContent.mutate directly
        // This ensures we always call the latest version without causing re-renders
        mutateRef.current({
          noteId,
          versionId,
          richTextContent: editor.document,
        });
      }
    }, 1000);

    // Store the debounced function in the ref for cleanup access
    debouncedSaveRef.current = debouncedSave;

    // Return the wrapper function that components will call on every editor change
    // This wrapper does two things:
    // 1. Immediately sets hasUnsavedChanges to true (shows "Unsaved changes" instantly)
    // 2. Calls the debounced save function (which waits 1s before actually saving)
    return (editor: BlockNoteEditor) => {
      setHasUnsavedChanges(true);
      debouncedSave(editor);
    };
  }, [versionId, noteId]);
  // IMPORTANT: saveNoteVersionContent is NOT in dependencies (see useRef explanation above)
  // Only versionId and noteId are included because:
  // - versionId changes when user switches versions → need new debounced function
  // - noteId changes when user switches notes → need new debounced function

  // ============================================================================
  // CLEANUP EFFECT: Cancels pending debounced saves when dependencies change
  // ============================================================================
  // When handleEditorChange is recreated (due to versionId or noteId changing),
  // we need to cancel any pending timer from the OLD debounced function.
  //
  // WHY THIS IS NEEDED:
  // User is editing Note A, types "Hello", then quickly switches to Note B.
  // Without cleanup: Timer from Note A could still fire and save content to Note A
  // With cleanup: Timer is cancelled, preventing incorrect save to wrong note
  //
  // The cleanup function runs:
  // 1. When the component unmounts
  // 2. Before the effect runs again (when handleEditorChange changes)
  useEffect(() => {
    return () => {
      // Cancel any pending debounced save using the properly typed ref
      // The DebouncedFunc type from lodash includes the cancel() method
      debouncedSaveRef.current?.cancel();
    };
  }, [handleEditorChange]);

  // ============================================================================
  // VERSION CHANGE EFFECT: Resets unsaved changes flag when version changes
  // ============================================================================
  // When the user switches to a different version of the note, we reset the
  // hasUnsavedChanges flag because we're now looking at different content.
  // This prevents showing "Unsaved changes" for the new version when there are none.
  useEffect(() => {
    setHasUnsavedChanges(false);
  }, [versionId]);

  // ============================================================================
  // DERIVED STATE: Calculate save status from multiple sources
  // ============================================================================
  // The save status is derived rather than stored in state to avoid race conditions.
  //
  // RACE CONDITION EXAMPLE (if we used direct state):
  // 1. User types "H" → sets status to "unsaved"
  // 2. Debounce timer expires → sets status to "saving", API request starts
  // 3. User types "e" → we'd need to decide: keep "saving" or change to "unsaved"?
  // 4. API completes → sets status to "saved", but user typed "e" so it's wrong!
  //
  // SOLUTION WITH DERIVED STATE:
  // Status is calculated on every render based on current conditions:
  // - If mutation.isError → show "error" (highest priority)
  // - Else if mutation.isPending → show "saving" (API request in flight)
  // - Else if hasUnsavedChanges → show "unsaved" (user typed but save hasn't started)
  // - Else if mutation.isSuccess → show "saved" (last save completed successfully)
  // - Else → show "idle" (initial state, nothing to save yet)
  //
  // This ensures correct status even in complex scenarios:
  // - User types → "unsaved" (hasUnsavedChanges = true)
  // - Timer expires → "saving" (isPending = true, hasUnsavedChanges still true)
  // - User types again → "saving" (isPending still true, hasUnsavedChanges true)
  // - Save completes → "unsaved" (isPending false, hasUnsavedChanges still true from second keystroke)
  // - Second save completes → "saved" (isPending false, hasUnsavedChanges reset to false)
  const saveStatus: SaveStatusType = saveNoteVersionContent.isError
    ? "error"
    : saveNoteVersionContent.isPending
      ? "saving"
      : hasUnsavedChanges
        ? "unsaved"
        : saveNoteVersionContent.isSuccess
          ? "saved"
          : "idle";

  return {
    saveStatus,
    handleEditorChange,
  };
}
