import { Note } from "@/lib/types";
import { TypographyH4 } from "../ui/typgrophy";
import { Badge } from "../ui/badge";
import { UsersRoundIcon } from "lucide-react";

interface NoteWidgetProps {
  note: Note;
}

const NoteWidget = ({ note }: NoteWidgetProps) => {
  return (
    <div className="border border-stone-200 rounded-md flex flex-col space-y-2 p-4 w-[350px]">
      {/* title and published */}
      <div className="flex justify-between">
        <p className="font-semibold">{note.title}</p>
        <Badge>
          {`${note.current_version.is_published ? "Published" : "Draft"} v${note.current_version.version_number}`}
        </Badge>
      </div>
      {/* brief preview */}
      <div>
        <p className="text-sm text-muted-foreground">
          Lorem Ipsum, this is a preview of the note content
        </p>
      </div>
      {/* edited and shared */}
      <div className="flex space-x-2">
        <p className="text-sm text-muted-foreground">{`Edited 3 days ago`}</p>
        <UsersRoundIcon className="h-4 w-4" />
      </div>
    </div>
  );
};
export default NoteWidget;
