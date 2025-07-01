"use client";

import dynamic from "next/dynamic";
import "@blocknote/mantine/style.css";
import type { BlockNoteEditor } from "@blocknote/core";

export interface RichTextEditorProps {
  initialContent?: any; // BlockNote JSON content
  onChange?: (editor: BlockNoteEditor) => void;
  readOnly?: boolean;
  className?: string;
}

// Dynamically import the entire editor to avoid SSR issues
const RichTextEditor = dynamic(
  async () => {
    const { BlockNoteView } = await import("@blocknote/mantine");
    const { useCreateBlockNote } = await import("@blocknote/react");

    const BlockNoteEditorComponent = ({
      initialContent,
      onChange,
      readOnly = false,
      className = "",
    }: RichTextEditorProps) => {
      const editor = useCreateBlockNote({
        initialContent,
      });

      return (
        <div className={`h-full w-full ${className}`}>
          <BlockNoteView
            editor={editor}
            className="custom-blocknote"
            editable={!readOnly}
            onChange={onChange}
          />
        </div>
      );
    };

    return BlockNoteEditorComponent;
  },
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-background"></div>,
  }
);

export default RichTextEditor;
