import { FolderWithItems } from "@/lib/types/folderTypes";
import { TypographyH4 } from "../ui/typgrophy";
import { AnimatedListItem } from "../animations";
import FolderListItem from "./FolderListItem";

interface FolderListProps {
  title: string;
  folders: FolderWithItems[];
}

const FolderList = ({ title, folders }: FolderListProps) => {
  return (
    <div>
      {/* the title */}
      <TypographyH4>{title}</TypographyH4>
      {/* the folders in this section */}
      <div className="rounded-md bg-background">
        {folders.map((folder, index) => (
          <AnimatedListItem
            key={folder.id}
            index={index}
            animation="fadeInRight"
          >
            <FolderListItem
              folder={folder}
              isLastFolder={index !== folders.length - 1}
            />
          </AnimatedListItem>
        ))}
      </div>
    </div>
  );
};
export default FolderList;
