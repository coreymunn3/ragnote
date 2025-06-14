import { Note } from "@/lib/types";
import { ReactNode } from "react";
import NoteWidget from "./NoteWidget";
import { cn } from "@/lib/utils";

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
      {title && <div className="">{title}</div>}

      {/* Scrollable container with fade effect */}
      <div className="relative">
        {/* Horizontal scrolling container */}
        <div className="flex overflow-x-auto pb-4 pt-1 px-1 -mx-1 space-x-4 scrollbar-hide scroll-smooth">
          {notes.map((note) => (
            <div key={note.id} className="flex-shrink-0">
              <NoteWidget note={note} />
            </div>
          ))}
        </div>

        {/* Right side fade effect */}
        <div className="absolute top-0 right-[-4] bottom-0 w-16 pointer-events-none bg-gradient-to-l from-background to-transparent" />
      </div>
    </div>
  );
};

export default NotesList;
