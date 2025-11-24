"use client";
import NoteToolbar from "@/components/web/NoteToolbar";
import { Note, PrismaNoteVersion } from "@/lib/types/noteTypes";
import BaseNotePageContent from "./BaseNotePageContent";

interface WebNotePageContentProps {
  note: Note;
  noteVersions: PrismaNoteVersion[];
}

const WebNotePageContent = ({
  note,
  noteVersions,
}: WebNotePageContentProps) => {
  return (
    <BaseNotePageContent
      note={note}
      noteVersions={noteVersions}
      renderToolbar={(props) => <NoteToolbar {...props} />}
    />
  );
};

export default WebNotePageContent;
