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
          className={`px-3 text-sm ${
            selectedVersion.is_published
              ? "bg-primary text-primary-foreground shadow hover:bg-primary/80"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          }`}
        >
          {`v${selectedVersion.version_number}`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="min-w-0">
        {noteVersions.map((version: PrismaNoteVersion) => (
          <DropdownMenuItem key={version.id} onClick={() => onSelect(version)}>
            <VersionBadge version={version} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default VersionSelector;
