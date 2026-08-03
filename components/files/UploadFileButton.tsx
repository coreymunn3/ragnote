"use client";

import { useRef, ChangeEvent } from "react";
import { Upload } from "lucide-react";
import { useUploadFile } from "@/hooks/file/useUploadFile";
import ProButton from "@/components/ProButton";
import { ACCEPTED_MIME_TYPES } from "@/services/file/fileService";

interface UploadFileButtonProps {
  folderId?: string;
  onSuccess?: () => void;
}

export function UploadFileButton({
  folderId,
  onSuccess,
}: UploadFileButtonProps) {
  const uploadMutation = useUploadFile({
    onSuccess: () => {
      onSuccess?.();
    },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadMutation.mutateAsync({ file, folderId });

    // Reset so the same file can be re-selected if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <ProButton
        label={uploadMutation.isPending ? "Uploading..." : "Upload File"}
        icon={<Upload className="h-4 w-4" />}
        isLoading={uploadMutation.isPending}
        onClick={() => fileInputRef.current?.click()}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_MIME_TYPES}
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
}
