"use client";

import { AnimatedListItem, AnimatedTypography } from "@/components/animations";
import { Separator } from "@/components/ui/separator";
import { TypographyMuted } from "@/components/ui/typography";
import WidgetList from "@/components/web/WidgetList";
import NoteWidget from "@/components/web/NoteWidget";
import { Button } from "@/components/ui/button";
import { FilePlus2Icon, FolderPenIcon, Trash2Icon } from "lucide-react";
import OptionsMenu from "@/components/OptionsMenu";
import { FolderWithNotes } from "@/lib/types/folderTypes";

interface WebFolderPageContentProps {
  folder: FolderWithNotes;
}

const WebFolderPageContent = ({ folder }: WebFolderPageContentProps) => {
  const unpinnedNotes = folder.notes.filter((note) => !note.is_pinned);
  const pinnedNotes = folder.notes.filter((note) => note.is_pinned);

  return (
    <div>
      <div className="flex items-center justify-between">
        <AnimatedTypography variant="h1">
          {folder.folder_name}
        </AnimatedTypography>
        <div className="flex space-x-2 items-center">
          <TypographyMuted>{`${folder.notes.length} Items`}</TypographyMuted>
          <Button variant={"ghost"}>
            <FilePlus2Icon className="h-4 w-4" />
          </Button>
          <OptionsMenu
            options={[
              {
                label: "Rename",
                icon: <FolderPenIcon className="h-4 w-4" />,
                onClick: () => console.log("TO DO - Rename Folder"),
              },
              {
                label: "Delete",
                icon: <Trash2Icon className="h-4 w-4" />,
                onClick: () => console.log("TO DO - Delete Folder"),
              },
            ]}
          />
        </div>
      </div>
      <Separator orientation="horizontal" className="mb-6" />

      <div className="flex flex-col space-y-4">
        {/* Display pinned notes prominently */}
        {pinnedNotes.length > 0 && (
          <AnimatedListItem index={1} animation="fadeIn">
            <WidgetList
              items={pinnedNotes}
              renderItem={(note) => <NoteWidget note={note} pinned />}
              displayMode="vertical"
              delay={1}
            />
          </AnimatedListItem>
        )}

        {/* Display notes in a responsive grid layout */}
        <AnimatedListItem index={2} animation="fadeIn">
          <WidgetList
            items={unpinnedNotes}
            renderItem={(note) => <NoteWidget note={note} />}
            displayMode="grid"
            delay={2}
          />
        </AnimatedListItem>
      </div>
    </div>
  );
};
export default WebFolderPageContent;
