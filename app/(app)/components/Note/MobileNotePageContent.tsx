"use client";
import { Note, PrismaNoteVersion } from "@/lib/types/noteTypes";

interface MobileNotePageContentProps {
  note: Note;
  noteVersions: PrismaNoteVersion[];
}

const MobileNotePageContent = ({
  note,
  noteVersions,
}: MobileNotePageContentProps) => {
  return (
    <div>
      <p>Mobile Note Page Content - To be implemented</p>
      <p>Note: {note.title}</p>
    </div>
  );
};
export default MobileNotePageContent;
