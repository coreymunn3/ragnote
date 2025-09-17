"use client";
import { ChatSession } from "@/lib/types/chatTypes";
import { Note } from "@/lib/types/noteTypes";

interface MobileDashboardContentProps {
  notes: Note[];
  chatSessions: ChatSession[];
}

const MobileDashboardContent = ({ notes }: MobileDashboardContentProps) => {
  return (
    <div>
      {/* TO DO - render recent notes */}
      {/* TO DO - render folder list */}
      Folders List Mobile
    </div>
  );
};
export default MobileDashboardContent;
