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
import { FolderIcon } from "lucide-react";

interface FolderWidgetProps {
  folder: PrismaFolder;
}

const FolderWidget = ({ folder }: FolderWidgetProps) => {
  return (
    <Link href={`/folder/${folder.id}`}>
      <Card className="p-4 hover:bg-accent transition-colors cursor-pointer">
        <div className="flex items-center space-x-3">
          <FolderIcon className="h-5 w-5 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{folder.folder_name}</p>
            <p className="text-sm text-muted-foreground">
              Deleted {new Date(folder.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
};
export default FolderWidget;
