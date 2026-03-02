import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import VersionBadge from "./VersionBadge";
import { PrismaNoteVersion } from "@/lib/types/noteTypes";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

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
  const isOnline = useOnlineStatus();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-1" asChild disabled={!isOnline}>
        <Button
          variant={"ghost"}
          className="p-0 flex items-center hover:bg-transparent dark:hover:bg-transparent disabled:opacity-100"
        >
          <VersionBadge version={selectedVersion} context="version" />
        </Button>
      </DropdownMenuTrigger>
      {isOnline && (
        <DropdownMenuContent align="center" className="min-w-0">
          {noteVersions.map((version: PrismaNoteVersion) => (
            <DropdownMenuItem
              key={version.id}
              onClick={() => onSelect(version)}
            >
              <VersionBadge version={version} context="version" />
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};
export default VersionSelector;
