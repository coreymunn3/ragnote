"use client";
import { useParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { NoteVersion } from "@/lib/types/noteTypes";
import VersionBadge from "./VersionBadge";
import { TypographyMuted, TypographyP } from "./ui/typography";
import { Button } from "./ui/button";
import { EllipsisVerticalIcon, ForwardIcon } from "lucide-react";

const NoteToolbar = () => {
  const { id, versionId } = useParams();
  // TO DO - get the note data using the page params
  const note = {
    id: "1",
    title: "Trips I want to take in 2025",
    current_version: {
      id: "abcd",
      version_number: 4,
      is_published: true,
      published_at: new Date(),
    },
    is_pinned: false,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    shared_with_count: 2,
  };

  // TO DO - get all versions of this note, published and draft
  const noteVersions = [
    {
      id: "abcd",
      version_number: 4,
      is_published: true,
      published_at: new Date(),
      created_at: new Date(),
    },
    {
      id: "abc1",
      version_number: 3,
      is_published: true,
      published_at: new Date(),
      created_at: new Date(),
    },
    {
      id: "abc2",
      version_number: 2,
      is_published: true,
      published_at: new Date(),
      created_at: new Date(),
    },
    {
      id: "abc3",
      version_number: 1,
      is_published: true,
      published_at: new Date(),
      created_at: new Date(),
    },
  ];

  return (
    <div className="flex items-center justify-between px-14 py-2 border-b border-accent">
      {/* left side - title and version */}
      <div className="flex items-start space-x-2">
        <TypographyP>{note.title}</TypographyP>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <VersionBadge version={noteVersions[0]} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {noteVersions.map((version: NoteVersion) => (
              <DropdownMenuItem key={version.id}>
                <VersionBadge version={version} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* right side - last edited & controls */}
      <div className="flex items-center space-x-2">
        <TypographyMuted>{`Last Edited ${note.updated_at.toLocaleDateString()}`}</TypographyMuted>
        <Button variant={"ghost"}>
          <ForwardIcon className="h-4 w-4" />
        </Button>
        <Button variant={"ghost"}>
          <EllipsisVerticalIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
export default NoteToolbar;
