import { Note } from "@/lib/types";
import { ReactNode } from "react";
import NoteWidget from "./NoteWidget";
import { cn } from "@/lib/utils";
import { ScrollableContainer } from "@/components/ui/scrollable-container";

interface NotesListProps {
  notes: Note[];
  title?: ReactNode;
  className?: string;
}

const NotesList = ({ notes, title, className }: NotesListProps) => {
  if (!notes || notes.length === 0) {
    return <div className="text-muted-foreground py-4">No notes available</div>;
  }

  return (
    <div className={cn("w-full", className)}>
      {title && <div className="mb-3">{title}</div>}

      {/* Use the new ScrollableContainer */}
      <ScrollableContainer containerClassName="pb-4 pt-1 px-1 -mx-1 space-x-5 scrollbar-hide">
        {notes.map((note) => (
          <div key={note.id} className="flex-shrink-0">
            <NoteWidget note={note} />
          </div>
        ))}
      </ScrollableContainer>
    </div>
  );
};

export default NotesList;
