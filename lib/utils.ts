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
} from "lucide-react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
