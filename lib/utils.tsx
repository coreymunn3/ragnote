import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  BrainIcon,
  CrownIcon,
  FileTextIcon,
  SaveIcon,
  SearchIcon,
  TypeIcon,
  FolderIcon,
  GlobeIcon,
  MessageCircleIcon,
  HistoryIcon,
  SparklesIcon,
  CheckIcon,
  FolderSyncIcon,
  HouseIcon,
  MessageSquare,
  Trash2Icon,
} from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// helper to show a folder Icon for system folders and home
export const getFolderIcon = (folderId: string) => {
  switch (folderId) {
    case "system_deleted":
      return <Trash2Icon className="h-4 w-4" />;
    // TODO: Re-enable for shared notes feature
    // case "system_shared":
    //   return <FolderSyncIcon className="h-4 w-4" />;
    case "system_chats":
      return <MessageSquare className="h-4 w-4" />;
    case "home":
      return <HouseIcon className="h-4 w-4" />;
    default:
      return <FolderIcon className="h-4 w-4" />;
  }
};

// Helper to get icon component from string name
export const getIconComponent = (iconName: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    BrainIcon,
    Crown: CrownIcon,
    FileText: FileTextIcon,
    Save: SaveIcon,
    Search: SearchIcon,
    Type: TypeIcon,
    Folder: FolderIcon,
    Globe: GlobeIcon,
    MessageCircle: MessageCircleIcon,
    History: HistoryIcon,
    Sparkles: SparklesIcon,
    Check: CheckIcon,
  };
  return iconMap[iconName] || CheckIcon;
};
