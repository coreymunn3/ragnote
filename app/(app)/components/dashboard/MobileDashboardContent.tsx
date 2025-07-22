"use client";
import { Note } from "@/lib/types/noteTypes";

interface MobileDashboardContentProps {
  notes: Note[];
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
