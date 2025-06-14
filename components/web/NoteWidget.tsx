import { Note } from "@/lib/types";
import { TypographyMuted, TypographySmall } from "../ui/typgrophy";
import { Badge } from "../ui/badge";
import { CalendarClockIcon, FileEditIcon, UsersRoundIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface NoteWidgetProps {
  note: Note;
}

const NoteWidget = ({ note }: NoteWidgetProps) => {
  const isPublished = note.current_version.is_published;

  return (
    <Card
      variant="dense"
      className="w-[300px] cursor-pointer hover:shadow-md hover:text-primary transition-all duration-200"
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-semibold line-clamp-1 overflow-ellipsis">
            {note.title}
          </CardTitle>
          <Badge
            variant={isPublished ? "default" : "secondary"}
            className="ml-2 whitespace-nowrap flex-shrink-0"
          >
            v{note.current_version.version_number}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <TypographyMuted className="line-clamp-2 overflow-ellipsis">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </TypographyMuted>
      </CardContent>

      <CardFooter>
        <div className="flex justify-between w-full">
          {/* Last Edited */}
          <div className="flex items-center text-muted-foreground">
            <TypographySmall>3 days ago</TypographySmall>
          </div>
          {/* Shared With */}
          {note.shared_with_count > 0 && (
            <div className="flex items-center text-muted-foreground">
              <UsersRoundIcon className="h-4 w-4 mr-1.5" />
              <TypographySmall>{note.shared_with_count}</TypographySmall>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default NoteWidget;
