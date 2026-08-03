"use client";

import { PrismaFile } from "@/lib/types/fileTypes";
import { useDeleteFile } from "@/hooks/file/useDeleteFile";
import { Button } from "@/components/ui/button";
import { Download, Trash2, FileText, FileImage, File } from "lucide-react";

interface FileItemProps {
  file: PrismaFile;
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return "Unknown size";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function FileTypeIcon({ mimeType }: { mimeType: string | null }) {
  if (!mimeType) return <File className="h-5 w-5 text-muted-foreground" />;
  if (mimeType.startsWith("image/"))
    return <FileImage className="h-5 w-5 text-blue-500" />;
  if (mimeType === "application/pdf")
    return <FileText className="h-5 w-5 text-red-500" />;
  return <FileText className="h-5 w-5 text-muted-foreground" />;
}

export function FileItem({ file }: FileItemProps) {
  const deleteMutation = useDeleteFile();

  const handleDownload = () => {
    window.open(`/api/files/${file.id}/view`, "_blank");
  };

  return (
    <div className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent transition-colors">
      <FileTypeIcon mimeType={file.mime_type} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.file_name}</p>
        <p className="text-xs text-muted-foreground">
          {formatBytes(file.file_size_bytes)} &middot;{" "}
          {new Date(file.uploaded_at).toLocaleDateString()}
        </p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDownload}
          title="Download / View"
        >
          <Download className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteMutation.mutate(file.id)}
          disabled={deleteMutation.isPending}
          title="Delete file"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
