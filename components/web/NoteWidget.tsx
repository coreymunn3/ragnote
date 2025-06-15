import { Note } from "@/lib/types";
import { TypographyMuted, TypographySmall } from "../ui/typgrophy";
import { Badge } from "../ui/badge";
import { PinIcon, UsersRoundIcon } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface NoteWidgetProps {
  note: Note;
  pinned?: boolean;
}

const NoteWidget = ({ note, pinned = false }: NoteWidgetProps) => {
  const isPublished = note.current_version.is_published;

  // Construct note URL
  const noteUrl = `/note/${note.id}`;

  return (
    <Link href={noteUrl} className="block w-full h-full">
      <Card
        variant="dense"
        className={`${pinned ? "bg-primary/15" : ""} cursor-pointer hover:shadow-md hover:text-primary transition-all duration-200`}
      >
        {/* Note Widget Header */}
        <CardHeader>
          <div className="flex justify-between items-start">
            {/* Header left - title & icon */}
            <div className="flex items-center space-x-2">
              {pinned && <PinIcon className="h-4 w-4" />}
              <CardTitle className="text-base font-semibold line-clamp-1 overflow-ellipsis">
                {note.title}
              </CardTitle>
            </div>
            {/* Header right - the published badge */}
            <Badge
              variant={isPublished ? "default" : "secondary"}
              className={`ml-2 whitespace-nowrap flex-shrink-0 ${pinned && !isPublished && "border-stone-500"}`}
            >
              v{note.current_version.version_number}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <TypographyMuted
            className={`line-clamp-2 ${pinned && "line-clamp-4"} overflow-ellipsis`}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem
            ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
            tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum
            dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua.
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
    </Link>
  );
};

export default NoteWidget;
