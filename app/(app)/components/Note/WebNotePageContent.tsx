"use client";
import { useParams } from "next/navigation";
import RichTextEditor from "@/components/RichTextEditor";
import type { BlockNoteEditor } from "@blocknote/core";

const WebNotePageContent = () => {
  const params = useParams();
  const { id, versionId } = params;
  // TO DO - get the note using the ID in the URL
  const note = {
    id: "1",
    title: "Trips I want to take in 2025",
    current_version: {
      id: "abcd",
      version_number: 7,
      is_published: true,
      published_at: new Date(),
    },
    is_pinned: false,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    shared_with_count: 2,
  };

  const version = {};

  // Handle content changes
  const handleEditorChange = (editor: BlockNoteEditor) => {
    console.log("Content changed:", editor);
    // Here you would save the content to your backend
  };

  return (
    <div className="pt-8">
      <RichTextEditor onChange={handleEditorChange} />
    </div>
  );
};
export default WebNotePageContent;
