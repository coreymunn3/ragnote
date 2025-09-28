import { ChatScopeObject } from "@/lib/types/chatTypes";
import { Badge } from "./ui/badge";
import { FileTextIcon, FolderIcon, GlobeIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { TooltipProvider } from "@radix-ui/react-tooltip";

interface ScopeBadgeProps {
  chatScope: ChatScopeObject;
}

const ScopeBadge = ({ chatScope }: ScopeBadgeProps) => {
  // Determine the icon based on scope
  const getScopeIcon = () => {
    switch (chatScope.scope) {
      case "note":
        return <FileTextIcon className="h-3 w-3" />;
      case "folder":
        return <FolderIcon className="h-3 w-3" />;
      case "global":
        return <GlobeIcon className="h-3 w-3" />;
    }
  };

  // Simple tooltip text
  const getTooltipText = () => {
    switch (chatScope.scope) {
      case "note":
        return "Note-specific chat";
      case "folder":
        return "Folder-wide chat";
      case "global":
        return "Global knowledge base";
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={"default"}
            className="ml-2 flex-shrink-0 w-6 h-6 p-1 flex items-center justify-center"
          >
            {getScopeIcon()}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ScopeBadge;
