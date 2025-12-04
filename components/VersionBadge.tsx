import { NoteVersionWithoutContent } from "@/lib/types/noteTypes";
import { Badge } from "./ui/badge";

interface VersionBadgeProps {
  version: NoteVersionWithoutContent | undefined;
}

const VersionBadge = ({ version }: VersionBadgeProps) => {
  // Handle undefined version
  if (!version) {
    return null;
  }

  return (
    <Badge
      variant={"secondary"}
      className={`ml-2 whitespace-nowrap flex-shrink-0`}
    >
      v{version.version_number}
    </Badge>
  );
};
export default VersionBadge;
