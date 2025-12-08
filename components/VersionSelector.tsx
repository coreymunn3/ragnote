import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import VersionBadge from "./VersionBadge";
import { PrismaNoteVersion } from "@/lib/types/noteTypes";

interface VersionSelectorProps {
  selectedVersion: PrismaNoteVersion;
  noteVersions: PrismaNoteVersion[];
  onSelect: (noteVersion: PrismaNoteVersion) => void;
}

const VersionSelector = ({
  selectedVersion,
  noteVersions,
  onSelect,
}: VersionSelectorProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-1" asChild>
        <Button
          variant={"ghost"}
          className="p-0 flex items-center hover:bg-transparent dark:hover:bg-transparent"
        >
          <VersionBadge version={selectedVersion} context="version" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="min-w-0">
        {noteVersions.map((version: PrismaNoteVersion) => (
          <DropdownMenuItem key={version.id} onClick={() => onSelect(version)}>
            <VersionBadge version={version} context="version" />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default VersionSelector;
