import { Note } from "@/lib/types";
import { ReactNode } from "react";
import NoteWidget from "./NoteWidget";
import { cn } from "@/lib/utils";
import { ScrollableContainer } from "@/components/ui/scrollable-container";
import { AnimatedListItem } from "../animations";
import { TypographyH3 } from "../ui/typgrophy";

interface WidgetListProps {
  notes: Note[];
  title?: string;
  icon?: ReactNode;
  className?: string;
}

const WidgetList = ({ notes, title, icon, className }: WidgetListProps) => {
  if (!notes || notes.length === 0) {
    return <div className="text-muted-foreground py-4">No notes available</div>;
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Title area */}
      <div className="flex items-center pb-3 space-x-2">
        {icon}
        {title && <TypographyH3 className="pb-0">{title}</TypographyH3>}
      </div>

      {/* Scrollable Container for the Notes */}
      <ScrollableContainer containerClassName="pb-2 space-x-5 scrollbar-hide">
        {notes.map((note, index) => (
          <AnimatedListItem key={note.id} index={index} animation="fadeInUp">
            <div className="flex-shrink-0">
              <NoteWidget note={note} />
            </div>
          </AnimatedListItem>
        ))}
      </ScrollableContainer>
    </div>
  );
};

export default WidgetList;
