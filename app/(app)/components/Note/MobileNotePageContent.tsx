"use client";
import NoteToolbar from "@/components/mobile/NoteToolbar";
import { Note, PrismaNoteVersion } from "@/lib/types/noteTypes";
import BaseNotePageContent from "./BaseNotePageContent";

interface MobileNotePageContentProps {
  note: Note;
  noteVersions: PrismaNoteVersion[];
}

const MobileNotePageContent = ({
  note,
  noteVersions,
}: MobileNotePageContentProps) => {
  return (
    <BaseNotePageContent
      note={note}
      noteVersions={noteVersions}
      renderToolbar={(props) => <NoteToolbar {...props} />}
    />
  );
};

export default MobileNotePageContent;
