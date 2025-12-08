import { NoteVersionWithoutContent } from "@/lib/types/noteTypes";
import { Badge } from "./ui/badge";

interface VersionBadgeProps {
  context?: "note" | "version";
  version: NoteVersionWithoutContent | undefined;
}

const VersionBadge = ({ version, context = "note" }: VersionBadgeProps) => {
  // Handle undefined version
  if (!version) {
    return null;
  }

  const createBadgeVariant = () => {
    if (context === "note") {
      // Show default if note has been published at least once (v2+)
      return version.version_number > 1 ? "default" : "muted";
    }
    if (context === "version") {
      // Show default if this specific version is published
      return version.is_published ? "default" : "muted";
    }
    return "muted";
  };

  return (
    <Badge
      variant={createBadgeVariant()}
      className={`ml-2 whitespace-nowrap flex-shrink-0`}
    >
      v{version.version_number}
    </Badge>
  );
};
export default VersionBadge;
