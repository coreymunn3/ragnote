import { Note } from "@/lib/types";
import { TypographyMuted, TypographySmall } from "../ui/typgrophy";
import { Badge } from "../ui/badge";
import { CalendarClockIcon, FileEditIcon, UsersRoundIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NoteWidgetProps {
  note: Note;
}

const NoteWidget = ({ note }: NoteWidgetProps) => {
  const isPublished = note.current_version.is_published;

  return (
    <div className="border border-stone-200 dark:border-accent rounded-lg flex flex-col space-y-3 p-5 w-[350px] cursor-pointer hover:shadow-md transition-all duration-200">
      {/* title and published */}
      <div className="flex justify-between items-start">
        <h3 className="font-semibold line-clamp-1 overflow-ellipsis max-w-[70%]">
          {note.title}
        </h3>
        <Badge
          variant={isPublished ? "default" : "secondary"}
          className="ml-2 whitespace-nowrap flex-shrink-0"
        >
          <span
            className={cn(
              "mr-1",
              isPublished ? "text-green-100" : "text-amber-100"
            )}
          >
            {isPublished ? "●" : "○"}
          </span>
          {`${isPublished ? "Published" : "Draft"} v${note.current_version.version_number}`}
        </Badge>
      </div>

      {/* brief preview */}
      <div className="flex-grow overflow-hidden">
        <TypographyMuted className="line-clamp-1 overflow-ellipsis">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </TypographyMuted>
      </div>

      {/* metadata footer */}
      <div className="flex items-center justify-between pt-2 border-t border-accent">
        {/* edited time */}
        <div className="flex items-center text-muted-foreground">
          <CalendarClockIcon className="h-3.5 w-3.5 mr-1.5" />
          <TypographySmall>Edited 3 days ago</TypographySmall>
        </div>

        {/* shared status */}
        {note.shared_with_count > 0 && (
          <div className="flex items-center text-muted-foreground">
            <UsersRoundIcon className="h-3.5 w-3.5 mr-1.5" />
            <TypographySmall>{note.shared_with_count}</TypographySmall>
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteWidget;
