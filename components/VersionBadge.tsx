import { PrismaNoteVersion } from "@/lib/types/noteTypes";
import { Badge } from "./ui/badge";

interface VersionBadgeProps {
  version: PrismaNoteVersion;
  withBorder?: boolean;
}

const VersionBadge = ({ version, withBorder = false }: VersionBadgeProps) => {
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
