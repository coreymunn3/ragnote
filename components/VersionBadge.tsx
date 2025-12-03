import { NoteVersionWithoutContent } from "@/lib/types/noteTypes";
import { Badge } from "./ui/badge";

interface VersionBadgeProps {
  version: NoteVersionWithoutContent;
}

const VersionBadge = ({ version }: VersionBadgeProps) => {
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
