import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME } from "@/lib/r2/r2-client";
import { prisma } from "@/lib/prisma";
import {
  ForbiddenError,
  NotFoundError,
  BadRequestError,
} from "@/lib/errors/apiErrors";
import {
  FILE_TYPE_CONFIGS,
  FileType,
  PrismaFile,
  StorageUsage,
} from "@/lib/types/fileTypes";
import { UserService } from "@/services/user/userService";
import { withErrorHandling } from "@/lib/errors/errorHandlers";
import { FILE_STORAGE_LIMITS } from "@/CONSTANTS";

// Accepted MIME types string for <input accept="..."> (exported for UI use)
export const ACCEPTED_MIME_TYPES = (["IMAGE", "PDF", "TEXT"] as FileType[])
  .flatMap((type) => FILE_TYPE_CONFIGS[type].mimeTypes)
  .join(",");

function getFileTypeFromMime(mimeType: string): FileType | null {
  for (const [type, config] of Object.entries(FILE_TYPE_CONFIGS)) {
    if (config.mimeTypes.includes(mimeType)) {
      return type as FileType;
    }
  }
  return null;
}

function getMaxFileSize(fileType: FileType): number {
  return FILE_TYPE_CONFIGS[fileType].maxSizeMB * 1024 * 1024;
}

// ---------------------------------------------------------------------------
// FileService
// ---------------------------------------------------------------------------

export class FileService {
  private userId: string;
  private userService: UserService;

  constructor(userId: string) {
    this.userId = userId;
    this.userService = new UserService();
  }

  /**
   * Upload a file to R2 and create the corresponding DB record.
   * Enforces PRO access, file type/size validation, and per-user storage quota.
   */
  public uploadFile = withErrorHandling(
    async (params: { file: File; folderId?: string }): Promise<PrismaFile> => {
      // 1. Check PRO access
      const hasAccess = await this.userService.hasProAccess({
        userId: this.userId,
      });
      if (!hasAccess) {
        throw new ForbiddenError("File uploads require a PRO subscription");
      }

      // 2. Validate file type
      const fileType = getFileTypeFromMime(params.file.type);
      if (!fileType) {
        throw new BadRequestError(`Unsupported file type: ${params.file.type}`);
      }

      // 3. Validate file size
      const maxSize = getMaxFileSize(fileType);
      if (params.file.size > maxSize) {
        throw new BadRequestError(
          `File too large. Maximum size is ${FILE_TYPE_CONFIGS[fileType].maxSizeMB}MB`,
        );
      }

      // 4. Check per-user storage quota
      const subscription = await prisma.user_subscription.findUnique({
        where: { user_id: this.userId },
        select: { storage_used_bytes: true, tier: true },
      });

      const storageLimit =
        FILE_STORAGE_LIMITS[subscription?.tier ?? "FREE"] ?? 0;
      const currentUsage = Number(subscription?.storage_used_bytes ?? 0);

      if (currentUsage + params.file.size > storageLimit) {
        const limitGB = storageLimit / 1024 / 1024 / 1024;
        throw new BadRequestError(
          `Storage quota exceeded. Your limit is ${limitGB}GB`,
        );
      }

      // 5. Build storage key: {userId}/{timestamp}-{sanitized-filename}
      const timestamp = Date.now();
      const sanitizedFilename = params.file.name.replace(
        /[^a-zA-Z0-9.\-_]/g,
        "_",
      );
      const storageKey = `${this.userId}/${timestamp}-${sanitizedFilename}`;

      // 6. Upload to R2
      const fileBuffer = Buffer.from(await params.file.arrayBuffer());

      await r2Client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: storageKey,
          Body: fileBuffer,
          ContentType: params.file.type,
        }),
      );

      // 7. Create DB record and update storage usage atomically
      const newFile = await prisma.$transaction(async (tx) => {
        const created = await tx.file.create({
          data: {
            user_id: this.userId,
            folder_id: params.folderId ?? null,
            file_name: params.file.name,
            file_type: fileType,
            storage_key: storageKey,
            file_size_bytes: params.file.size,
            mime_type: params.file.type,
          },
        });

        await tx.user_subscription.update({
          where: { user_id: this.userId },
          data: {
            storage_used_bytes: {
              increment: params.file.size,
            },
          },
        });

        return created;
      });

      return newFile as PrismaFile;
    },
  );

  /**
   * List files for this user, optionally filtered by folder.
   */
  public getFiles = withErrorHandling(
    async (folderId?: string): Promise<PrismaFile[]> => {
      const files = await prisma.file.findMany({
        where: {
          user_id: this.userId,
          folder_id: folderId ?? undefined,
          is_deleted: false,
        },
        orderBy: { uploaded_at: "desc" },
      });

      return files as PrismaFile[];
    },
  );

  /**
   * Get a single file's metadata. Throws NotFoundError if not found or not owned.
   */
  public getFile = withErrorHandling(
    async (fileId: string): Promise<PrismaFile> => {
      const file = await prisma.file.findUnique({
        where: { id: fileId, user_id: this.userId, is_deleted: false },
      });

      if (!file) {
        throw new NotFoundError("File not found");
      }

      return file as PrismaFile;
    },
  );

  /**
   * Stream a file from R2 for the API proxy endpoint.
   * Returns the raw ReadableStream, content type, and file name.
   * Used by /api/files/[fileId]/view to serve files without exposing R2 URLs.
   */
  public streamFile = withErrorHandling(
    async (
      fileId: string,
    ): Promise<{
      stream: ReadableStream;
      contentType: string;
      fileName: string;
    }> => {
      const file = await this.getFile(fileId);

      if (!file.storage_key) {
        throw new NotFoundError("File has no storage key");
      }

      const response = await r2Client.send(
        new GetObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: file.storage_key,
        }),
      );

      if (!response.Body) {
        throw new NotFoundError("File not found in storage");
      }

      return {
        stream: response.Body.transformToWebStream(),
        contentType: file.mime_type ?? "application/octet-stream",
        fileName: file.file_name,
      };
    },
  );

  /**
   * Move a file to a different folder (DB-only; R2 key is unchanged).
   */
  public moveFile = withErrorHandling(
    async (fileId: string, newFolderId: string | null): Promise<PrismaFile> => {
      // Verify ownership first
      await this.getFile(fileId);

      const updated = await prisma.file.update({
        where: { id: fileId },
        data: { folder_id: newFolderId },
      });

      return updated as PrismaFile;
    },
  );

  /**
   * Soft-delete a file in the DB, decrement storage usage, and remove from R2.
   * R2 deletion is best-effort — a DB failure will roll back the soft delete.
   */
  public deleteFile = withErrorHandling(
    async (fileId: string): Promise<void> => {
      const file = await this.getFile(fileId);

      await prisma.$transaction(async (tx) => {
        await tx.file.update({
          where: { id: fileId },
          data: { is_deleted: true },
        });

        if (file.file_size_bytes) {
          await tx.user_subscription.update({
            where: { user_id: this.userId },
            data: {
              storage_used_bytes: {
                decrement: file.file_size_bytes,
              },
            },
          });
        }
      });

      // Best-effort R2 deletion — don't fail the request if this errors
      if (file.storage_key) {
        try {
          await r2Client.send(
            new DeleteObjectCommand({
              Bucket: R2_BUCKET_NAME,
              Key: file.storage_key,
            }),
          );
        } catch (error) {
          console.error(
            `Failed to delete R2 object for file ${fileId}:`,
            error,
          );
        }
      }
    },
  );

  /**
   * Return the current storage usage for this user.
   */
  public getStorageUsage = withErrorHandling(
    async (): Promise<StorageUsage> => {
      const subscription = await prisma.user_subscription.findUnique({
        where: { user_id: this.userId },
        select: { storage_used_bytes: true, tier: true },
      });

      const tier = subscription?.tier ?? "FREE";
      const used = Number(subscription?.storage_used_bytes ?? 0);
      const total = FILE_STORAGE_LIMITS[tier] ?? 0;
      const percentage = total > 0 ? (used / total) * 100 : 0;

      return { used, total, percentage };
    },
  );
}
