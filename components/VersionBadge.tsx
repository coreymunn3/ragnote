import { NoteVersionWithoutContent } from "@/lib/types/noteTypes";
import { Badge } from "./ui/badge";

interface VersionBadgeProps {
  version: NoteVersionWithoutContent | undefined;
  withBorder?: boolean;
}

const VersionBadge = ({ version, withBorder = false }: VersionBadgeProps) => {
  // Handle undefined version
  if (!version) {
    return null;
  }

  return (
    <Badge
      variant={version.is_published ? "default" : "secondary"}
      className={`ml-2 whitespace-nowrap flex-shrink-0 ${withBorder && !version.is_published && "border-stone-500"}`}
    >
      v{version.version_number}
    </Badge>
  );
};
export default VersionBadge;
