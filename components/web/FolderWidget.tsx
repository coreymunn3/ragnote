"use client";
import { PrismaFolder } from "@/lib/types/folderTypes";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import Link from "next/link";
import { ArchiveRestore, FolderIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useUpdateFolder } from "@/hooks/folder/useUpdateFolder";

interface FolderWidgetProps {
  folder: PrismaFolder;
}

const FolderWidget = ({ folder }: FolderWidgetProps) => {
  const updateFolderMutation = useUpdateFolder();

  const handleRecover = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    updateFolderMutation.mutate({
      folderId: folder.id,
      action: "recover",
    });
  };

  return (
    <Link href={`/folder/${folder.id}`}>
      <Card className="p-4 hover:bg-accent transition-colors cursor-pointer">
        <div className="flex items-center justify-between space-x-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <FolderIcon className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{folder.folder_name}</p>
              <p className="text-sm text-muted-foreground">
                Deleted {new Date(folder.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          {folder.is_deleted && (
            <Button variant={"ghost"} onClick={handleRecover}>
              <ArchiveRestore className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    </Link>
  );
};
export default FolderWidget;
