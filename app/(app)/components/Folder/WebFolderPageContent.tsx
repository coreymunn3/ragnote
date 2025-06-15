import { AnimatedTypography } from "@/components/animations";
import { Separator } from "@/components/ui/separator";
import { TypographyMuted } from "@/components/ui/typgrophy";
import WidgetList from "@/components/web/WidgetList";
import NoteWidget from "@/components/web/NoteWidget";

const WebFolderPageContent = () => {
  // TO DO - get the folder data and all of its notes (not pinned)
  const folder = {
    id: "1",
    folder_name: "All Notes",
    link: `/folder/1`,
    notes: [
      {
        id: "1",
        title: "Trips I want to take in 2025",
        current_version: {
          version_number: 7,
          is_published: true,
          published_at: new Date(),
        },
        is_pinned: false,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
        shared_with_count: 0,
      },
      {
        id: "2",
        title: "Beef Stew Recipe",
        current_version: {
          version_number: 2,
          is_published: true,
          published_at: new Date(),
        },
        is_pinned: false,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
        shared_with_count: 0,
      },
      {
        id: "3",
        title: "Groceries",
        current_version: {
          version_number: 4,
          is_published: false,
          published_at: null,
        },
        is_pinned: false,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
        shared_with_count: 0,
      },
      {
        id: "4",
        title: "2025 Summer Training Plans",
        current_version: {
          version_number: 14,
          is_published: true,
          published_at: new Date(),
        },
        is_pinned: true,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
        shared_with_count: 0,
      },
      {
        id: "5",
        title: "Trips I want to take in 2025",
        current_version: {
          version_number: 7,
          is_published: true,
          published_at: new Date(),
        },
        is_pinned: false,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
        shared_with_count: 0,
      },
      {
        id: "6",
        title: "Beef Stew Recipe",
        current_version: {
          version_number: 2,
          is_published: true,
          published_at: new Date(),
        },
        is_pinned: false,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
        shared_with_count: 0,
      },
      {
        id: "7",
        title: "Groceries",
        current_version: {
          version_number: 4,
          is_published: false,
          published_at: null,
        },
        is_pinned: true,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
        shared_with_count: 0,
      },
      {
        id: "8",
        title: "2025 Summer Training Plans",
        current_version: {
          version_number: 14,
          is_published: true,
          published_at: new Date(),
        },
        is_pinned: false,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
        shared_with_count: 0,
      },
    ],
  };

  const unpinnedNotes = folder.notes.filter((note) => !note.is_pinned);
  const pinnedNotes = folder.notes.filter((note) => note.is_pinned);

  return (
    <div>
      <div className="flex items-center justify-between">
        <AnimatedTypography variant="h1">
          {folder.folder_name}
        </AnimatedTypography>
        <TypographyMuted>{`${folder.notes.length} Items`}</TypographyMuted>
      </div>
      <Separator orientation="horizontal" className="mb-6" />

      {/* Display pinned notes prominently */}
      <WidgetList
        title="Pinned"
        items={pinnedNotes}
        renderItem={(note) => <NoteWidget note={note} />}
        displayMode="vertical"
      />
      {/* Display notes in a responsive grid layout */}
      <WidgetList
        title="Notes"
        items={unpinnedNotes}
        renderItem={(note) => <NoteWidget note={note} />}
        displayMode="grid"
      />
    </div>
  );
};
export default WebFolderPageContent;
