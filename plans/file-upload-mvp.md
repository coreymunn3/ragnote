# File Upload Feature - MVP Implementation Plan (Revised)

## Overview

Enable PRO users to upload files (images, PDFs, text files) to folders, view them alongside notes, and download them. Images can be inserted inline in notes via the BlockNote editor.

**Core Principle**: Upload → Store → View → Download (no text extraction or embedding in MVP)

**Key Architecture Decisions**:

- **Cloudflare R2** for storage (10GB free tier vs Supabase's 50MB)
- **API proxy pattern** for stable, permanent URLs (no signed URLs)
- **Per-user storage limits** tracked in database
- **Service layer authorization** using `userService.hasProAccess()`
- **4MB max file size** (conservative for free tier)

---

## MVP Feature List

### User-Facing Features (PRO Only)

1. **Upload Files to Folders**

   - Support: Images (JPG, PNG, GIF, WebP), PDFs, Text files
   - Max file size: **4MB per file**
   - Storage per user:
     - FREE tier: **0** (no uploads, reserved for future)
     - PRO tier: **1 GB total**
   - FREE users: No file upload capability

2. **View Files in Folders**

   - Files appear alongside notes in folder views
   - Display file icon, name, size, upload date
   - Separate visual treatment from notes

3. **Insert Images Inline in Notes**

   - Use BlockNote `/` menu → "Image" → file picker
   - Upload image → render inline immediately
   - Image URL stored in note's `rich_text_content`

4. **Download Files**

   - Click file to download
   - **Stable API URLs**: `/api/files/{fileId}/view`
   - URLs never expire (API validates access on every request)

5. **Delete Files**

   - Soft delete in database
   - Remove from R2 storage
   - Update user's storage usage and db file records

6. **Move Files Between Folders**

   - Update `folder_id` in database only
   - File stays in same storage location

7. **Storage Usage Tracking**
   - Display used/total storage for PRO users
   - Enforce per-user limits on uploads
   - Track in `user_subscription.storage_used_bytes`

---

## Architecture Decisions

### Storage Solution: Cloudflare R2

**Why Cloudflare R2:**

- **10GB free tier** (vs Supabase's 50MB) - 200x more storage
- **Unlimited egress bandwidth** (no bandwidth costs)
- **Better pricing at scale**: $0.015/GB/month (vs Supabase's $0.021/GB)
- **S3-compatible API** (easy to migrate if needed)
- **No vendor lock-in** (standard S3 protocol)

**Bucket Configuration:**

- **Bucket name**: `wysenote-files`
- **Access**: Private (API-controlled via proxy endpoints)
- **Path structure**: `{userId}/{timestamp}-{filename}`
  - Example: `user_abc123/1704067200000-document.pdf`
  - **NO folder ID in path** (folder association is database metadata only)
  - Allows moving files between folders without physical file relocation

**Example Storage Structure:**

```
wysenote-files/                           # Private R2 bucket
├── user-abc-123-def-456/
│   ├── 1712345678901-meeting-notes.pdf
│   ├── 1712345678902-screenshot.png
│   └── 1712345678903-ideas.txt
└── user-xyz-789-ghi-012/
    └── ...
```

### Security Model: API Proxy (No Signed URLs)

**Why API Proxy Instead of Signed URLs:**

- ✅ **Stable, permanent URLs** that never expire
- ✅ **Immediate access revocation** when files are deleted
- ✅ **Access control on every request** (validates ownership)
- ✅ **Full audit trail** (log every file access)
- ✅ **No URL leakage risk** (URLs useless without valid session)
- ✅ **Simpler implementation** (no URL regeneration logic)

**How It Works:**

1. Database stores storage key only: `{userId}/{timestamp}-{filename}`
2. Frontend uses stable API URL: `/api/files/{fileId}/view`
3. API validates user owns file or file is in their note
4. API streams file from R2 to browser
5. Browser caches with `Cache-Control` header (1 hour)

**Trade-off**: Extra hop through API (but minimal with streaming + browser caching)

### File Type System

**Supported File Types (MVP):**

- **Images**: PNG, JPG, JPEG
- **PDFs**: PDF documents (view/download only in MVP)
- **Text**: TXT, MD files
- Later: Audio

**File Size & Storage Limits:**

- **Max file size**: **10MB per file**
- **Storage per user**:
  - FREE tier: 0 GB (no uploads in MVP)
  - PRO tier: 1 GB total
- **Tracked in database**: `user_subscription.storage_used_bytes`
- **Enforced at service layer**: Check user's current usage before upload

**Future Extensions:**

- Audio files (MP3, WAV)
- Video files (MP4, WEBM)
- Office documents (DOCX, XLSX, PPTX)
- Archives (ZIP, TAR)

---

## Database Changes

### Migration: Add File Upload Fields

Update the existing `file` and `user_subscription` models in [`prisma/schema.prisma`](prisma/schema.prisma:194):

**Changes to `file` model:**

```prisma
model file {
  id                String    @id @default(uuid()) @db.Uuid
  user_id           String    @db.Uuid
  folder_id         String?   @db.Uuid
  file_name         String
  file_type         FileType
  file_url          String?   // KEEP for backward compatibility, but use storage_key for R2

  // NEW FIELDS FOR MVP
  storage_key       String?   // R2 path: {userId}/{timestamp}-{filename}
  file_size_bytes   Int?      // For quota tracking
  mime_type         String?   // e.g., "image/jpeg", "application/pdf"
  width             Int?      // Image width (for images only)
  height            Int?      // Image height (for images only)

  // Future processing fields (not used in MVP)
  is_processed      Boolean   @default(false)
  processing_error  String?
  last_indexed_at   DateTime? @db.Timestamptz(3)

  is_deleted        Boolean   @default(false)
  uploaded_at       DateTime  @default(now()) @db.Timestamptz(3)
  updated_at        DateTime  @updatedAt @db.Timestamptz(3)

  user              app_user             @relation(fields: [user_id], references: [id], onDelete: Cascade)
  folder            folder?              @relation(fields: [folder_id], references: [id], onDelete: SetNull)
  content_chunks    file_content_chunk[] // For future text extraction

  @@index([user_id, is_deleted])
  @@index([folder_id])
  @@index([storage_key])
}
```

**Changes to `user_subscription` model:**

```prisma
model user_subscription {
  id                     String           @id @default(uuid()) @db.Uuid
  user_id                String           @unique @db.Uuid
  tier                   SubscriptionTier
  end_date               DateTime?        @db.Timestamptz(3)
  stripe_subscription_id String?          @unique
  stripe_price_id        String?
  storage_used_bytes     BigInt           @default(0) // NEW: Track per-user storage usage
  created_at             DateTime         @default(now()) @db.Timestamptz(3)
  updated_at             DateTime         @updatedAt @db.Timestamptz(3)

  user app_user @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([storage_used_bytes])
  @@map("user_subscription")
}
```

**Update `FileType` enum (add TEXT):**

```prisma
enum FileType {
  PDF
  DOCX
  IMAGE
  AUDIO
  TEXT  // NEW: For .txt and .md files
}
```

**Migration Command:**

```bash
npx prisma migrate dev --name add_file_upload_r2_fields
```

---

## Implementation Tasks

### 1. Cloudflare R2 Setup

#### Install Dependencies

```bash
npm install @aws-sdk/client-s3
```

#### Environment Variables

Add to `.env.local`:

```env
# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=wysenote-files
```

#### Create R2 Client

**File**: `lib/r2/r2Client.ts`

```typescript
import { S3Client } from "@aws-sdk/client-s3";

if (
  !process.env.R2_ACCOUNT_ID ||
  !process.env.R2_ACCESS_KEY_ID ||
  !process.env.R2_SECRET_ACCESS_KEY
) {
  throw new Error("Missing R2 environment variables");
}

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME!;
```

#### Create Storage Bucket

In Cloudflare R2 Dashboard:

1. Go to **R2** section in Cloudflare dashboard
2. Create new bucket: `wysenote-files`
3. Set to **Private** (not public)
4. Generate API tokens with read/write permissions
5. Add credentials to `.env.local`

---

### 2. Backend Implementation

#### File Type Configuration

**File**: `lib/types/fileTypes.ts`

```typescript
export enum FileType {
  IMAGE = "IMAGE",
  PDF = "PDF",
  TEXT = "TEXT",
}

export type FileTypeConfig = {
  type: FileType;
  displayName: string;
  icon: string;
  mimeTypes: string[];
  extensions: string[];
  maxSizeMB: number;
  canInlineRender: boolean;
};

export const FILE_TYPE_CONFIGS: Record<FileType, FileTypeConfig> = {
  IMAGE: {
    type: FileType.IMAGE,
    displayName: "Image",
    icon: "🖼️",
    mimeTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    extensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    maxSizeMB: 4, // 4MB limit
    canInlineRender: true,
  },
  PDF: {
    type: FileType.PDF,
    displayName: "PDF Document",
    icon: "📄",
    mimeTypes: ["application/pdf"],
    extensions: [".pdf"],
    maxSizeMB: 4, // 4MB limit
    canInlineRender: false,
  },
  TEXT: {
    type: FileType.TEXT,
    displayName: "Text File",
    icon: "📝",
    mimeTypes: ["text/plain"],
    extensions: [".txt", ".md"],
    maxSizeMB: 4, // 4MB limit
    canInlineRender: false,
  },
};

export function getFileTypeFromMime(mimeType: string): FileType | null {
  for (const [type, config] of Object.entries(FILE_TYPE_CONFIGS)) {
    if (config.mimeTypes.includes(mimeType)) {
      return type as FileType;
    }
  }
  return null;
}

export function getMaxFileSize(fileType: FileType): number {
  return FILE_TYPE_CONFIGS[fileType].maxSizeMB * 1024 * 1024;
}

// Storage limits per tier
export const STORAGE_LIMITS = {
  FREE: 0,
  PRO: 1 * 1024 * 1024 * 1024, // 1 GB
};
```

#### File Service

**File**: `services/file/fileService.ts`

```typescript
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME } from "@/lib/r2/r2Client";
import { prisma } from "@/lib/prisma";
import {
  ForbiddenError,
  NotFoundError,
  BadRequestError,
} from "@/lib/errors/apiErrors";
import {
  getFileTypeFromMime,
  getMaxFileSize,
  STORAGE_LIMITS,
} from "@/lib/types/fileTypes";
import { UserService } from "@/services/user/userService";
import { withErrorHandling } from "@/lib/errors/errorHandlers";

export class FileService {
  private userId: string;
  private userService: UserService;

  constructor(userId: string) {
    this.userId = userId;
    this.userService = new UserService();
  }

  /**
   * Upload file to R2 and create DB record
   * Authorization checked at service layer
   */
  public uploadFile = withErrorHandling(
    async (params: { file: File; folderId?: string }) => {
      // 1. Check PRO access using UserService
      const hasAccess = await this.userService.hasProAccess({
        userId: this.userId,
      });
      if (!hasAccess) {
        throw new ForbiddenError("File uploads require PRO subscription");
      }

      // 2. Validate file type
      const fileType = getFileTypeFromMime(params.file.type);
      if (!fileType) {
        throw new BadRequestError(`Unsupported file type: ${params.file.type}`);
      }

      // 3. Check file size
      const maxSize = getMaxFileSize(fileType);
      if (params.file.size > maxSize) {
        throw new BadRequestError(
          `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`,
        );
      }

      // 4. Check storage quota (per-user limit)
      const subscription = await prisma.user_subscription.findUnique({
        where: { user_id: this.userId },
        select: { storage_used_bytes: true, tier: true },
      });

      const storageLimit =
        STORAGE_LIMITS[subscription?.tier as keyof typeof STORAGE_LIMITS] ||
        STORAGE_LIMITS.FREE;
      const currentUsage = subscription?.storage_used_bytes || 0;

      if (currentUsage + params.file.size > storageLimit) {
        throw new BadRequestError(
          `Storage quota exceeded. Limit: ${storageLimit / 1024 / 1024 / 1024}GB`,
        );
      }

      // 5. Generate storage key (no folder ID in path)
      const timestamp = Date.now();
      const sanitizedFilename = params.file.name.replace(
        /[^a-zA-Z0-9.-]/g,
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

      // 7. Create DB record
      const file = await prisma.$transaction(async (tx) => {
        // Create file record
        const newFile = await tx.file.create({
          data: {
            user_id: this.userId,
            folder_id: params.folderId,
            file_name: params.file.name,
            file_type: fileType,
            storage_key: storageKey,
            file_size_bytes: params.file.size,
            mime_type: params.file.type,
          },
        });

        // Update user's storage usage
        await tx.user_subscription.update({
          where: { user_id: this.userId },
          data: {
            storage_used_bytes: {
              increment: params.file.size,
            },
          },
        });

        return newFile;
      });

      return file;
    },
  );

  /**
   * Get file metadata (for listing)
   */
  public getFiles = withErrorHandling(async (folderId?: string) => {
    return prisma.file.findMany({
      where: {
        user_id: this.userId,
        folder_id: folderId,
        is_deleted: false,
      },
      orderBy: { uploaded_at: "desc" },
    });
  });

  /**
   * Get single file metadata
   */
  public getFile = withErrorHandling(async (fileId: string) => {
    const file = await prisma.file.findUnique({
      where: { id: fileId, user_id: this.userId, is_deleted: false },
    });

    if (!file) {
      throw new NotFoundError("File not found");
    }

    return file;
  });

  /**
   * Stream file from R2 (for API proxy)
   */
  public streamFile = withErrorHandling(async (fileId: string) => {
    const file = await this.getFile(fileId);

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
      stream: response.Body,
      contentType: file.mime_type,
      fileName: file.file_name,
    };
  });

  /**
   * Move file to different folder (just updates DB)
   */
  public moveFile = withErrorHandling(
    async (fileId: string, newFolderId: string | null) => {
      const file = await this.getFile(fileId);

      return prisma.file.update({
        where: { id: fileId },
        data: { folder_id: newFolderId },
      });
    },
  );

  /**
   * Delete file (soft delete + remove from storage)
   */
  public deleteFile = withErrorHandling(async (fileId: string) => {
    const file = await this.getFile(fileId);

    await prisma.$transaction(async (tx) => {
      // Soft delete in DB
      await tx.file.update({
        where: { id: fileId },
        data: { is_deleted: true },
      });

      // Update user's storage usage
      await tx.user_subscription.update({
        where: { user_id: this.userId },
        data: {
          storage_used_bytes: {
            decrement: file.file_size_bytes,
          },
        },
      });
    });

    // Delete from R2 (best effort - don't fail if it errors)
    try {
      await r2Client.send(
        new DeleteObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: file.storage_key,
        }),
      );
    } catch (error) {
      console.error("Failed to delete from R2:", error);
      // Don't throw - file is already soft deleted
    }
  });

  /**
   * Get storage usage for user
   */
  public getStorageUsage = withErrorHandling(async () => {
    const subscription = await prisma.user_subscription.findUnique({
      where: { user_id: this.userId },
      select: { storage_used_bytes: true, tier: true },
    });

    const tier = (subscription?.tier as keyof typeof STORAGE_LIMITS) || "FREE";
    const used = subscription?.storage_used_bytes || 0;
    const total = STORAGE_LIMITS[tier];

    return {
      used,
      total,
      percentage: (used / total) * 100,
    };
  });
}
```

#### API Routes

**File**: `app/api/files/upload/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { FileService } from "@/services/file/fileService";
import { getDbUser } from "@/lib/getDbUser";
import { handleApiError } from "@/lib/errors/apiRouteHandlers";

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getDbUser(clerkId);
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folderId = formData.get("folderId") as string | undefined;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileService = new FileService(dbUser.id);
    const uploadedFile = await fileService.uploadFile({ file, folderId });

    return NextResponse.json(uploadedFile);
  } catch (error: any) {
    return handleApiError(error);
  }
}
```

**File**: `app/api/files/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { FileService } from "@/services/file/fileService";
import { getDbUser } from "@/lib/getDbUser";
import { handleApiError } from "@/lib/errors/apiRouteHandlers";

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getDbUser(clerkId);
    const { searchParams } = new URL(req.url);
    const folderId = searchParams.get("folderId") || undefined;

    const fileService = new FileService(dbUser.id);
    const files = await fileService.getFiles(folderId);

    return NextResponse.json(files);
  } catch (error: any) {
    return handleApiError(error);
  }
}
```

**File**: `app/api/files/[fileId]/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { FileService } from "@/services/file/fileService";
import { getDbUser } from "@/lib/getDbUser";
import { handleApiError } from "@/lib/errors/apiRouteHandlers";

export async function GET(
  req: NextRequest,
  { params }: { params: { fileId: string } },
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getDbUser(clerkId);
    const fileService = new FileService(dbUser.id);
    const file = await fileService.getFile(params.fileId);

    return NextResponse.json(file);
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { fileId: string } },
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getDbUser(clerkId);
    const fileService = new FileService(dbUser.id);
    await fileService.deleteFile(params.fileId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { fileId: string } },
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getDbUser(clerkId);
    const { folderId } = await req.json();

    const fileService = new FileService(dbUser.id);
    const updatedFile = await fileService.moveFile(params.fileId, folderId);

    return NextResponse.json(updatedFile);
  } catch (error: any) {
    return handleApiError(error);
  }
}
```

**File**: `app/api/files/[fileId]/view/route.ts` (API Proxy for stable URLs)

```typescript
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { FileService } from "@/services/file/fileService";
import { getDbUser } from "@/lib/getDbUser";
import { handleApiError } from "@/lib/errors/apiRouteHandlers";

export async function GET(
  req: NextRequest,
  { params }: { params: { fileId: string } },
) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const dbUser = await getDbUser(clerkId);
    const fileService = new FileService(dbUser.id);

    // Stream file from R2
    const { stream, contentType, fileName } = await fileService.streamFile(
      params.fileId,
    );

    // Convert stream to Response
    return new Response(stream as any, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "private, max-age=3600", // Browser caches for 1 hour
      },
    });
  } catch (error: any) {
    const errorResponse = handleApiError(error);
    return new Response(errorResponse.body, {
      status: errorResponse.status,
      headers: errorResponse.headers,
    });
  }
}
```

**File**: `app/api/files/storage/route.ts` (Get storage usage)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { FileService } from "@/services/file/fileService";
import { getDbUser } from "@/lib/getDbUser";
import { handleApiError } from "@/lib/errors/apiRouteHandlers";

export async function GET(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await getDbUser(clerkId);
    const fileService = new FileService(dbUser.id);
    const usage = await fileService.getStorageUsage();

    return NextResponse.json(usage);
  } catch (error: any) {
    return handleApiError(error);
  }
}
```

---

### 3. Frontend Implementation

#### React Query Hooks

**File**: `hooks/file/useUploadFile.ts`

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleClientSideMutationError } from "@/lib/errors/handleClientSideMutationError";

export const useUploadFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { file: File; folderId?: string }) => {
      const formData = new FormData();
      formData.append("file", params.file);
      if (params.folderId) formData.append("folderId", params.folderId);

      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Upload failed");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["storage-usage"] });
    },
    onError: handleClientSideMutationError,
  });
};
```

**File**: `hooks/file/useGetFiles.ts`

```typescript
import { useQuery } from "@tanstack/react-query";

export const useGetFiles = (folderId?: string) => {
  return useQuery({
    queryKey: ["files", folderId],
    queryFn: async () => {
      const url = folderId ? `/api/files?folderId=${folderId}` : "/api/files";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch files");
      return response.json();
    },
  });
};
```

**File**: `hooks/file/useDeleteFile.ts`

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleClientSideMutationError } from "@/lib/errors/handleClientSideMutationError";

export const useDeleteFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fileId: string) => {
      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Delete failed");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
      queryClient.invalidateQueries({ queryKey: ["storage-usage"] });
    },
    onError: handleClientSideMutationError,
  });
};
```

**File**: `hooks/file/useGetStorageUsage.ts`

```typescript
import { useQuery } from "@tanstack/react-query";

export const useGetStorageUsage = () => {
  return useQuery({
    queryKey: ["storage-usage"],
    queryFn: async () => {
      const response = await fetch("/api/files/storage");
      if (!response.ok) throw new Error("Failed to fetch storage usage");
      return response.json();
    },
  });
};
```

#### UI Components

**File**: `components/UploadFileButton.tsx`

```typescript
'use client';

import { useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useUploadFile } from '@/hooks/file/useUploadFile';

interface UploadFileButtonProps {
  folderId?: string;
  onSuccess?: () => void;
}

export const UploadFileButton = ({ folderId, onSuccess }: UploadFileButtonProps) => {
  const uploadMutation = useUploadFile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadMutation.mutateAsync({ file, folderId });
      onSuccess?.();
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <>
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploadMutation.isPending}
      >
        <Upload className="mr-2 h-4 w-4" />
        {uploadMutation.isPending ? 'Uploading...' : 'Upload File'}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,.pdf,.txt,.md"
        onChange={handleFileSelect}
        className="hidden"
      />
    </>
  );
};
```

**File**: `components/FileItem.tsx`

```typescript
'use client';

import { Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeleteFile } from '@/hooks/file/useDeleteFile';
import { FILE_TYPE_CONFIGS } from '@/lib/types/fileTypes';

interface FileItemProps {
  file: {
    id: string;
    file_name: string;
    file_type: string;
    file_size_bytes: number;
    uploaded_at: string;
  };
}

export const FileItem = ({ file }: FileItemProps) => {
  const deleteMutation = useDeleteFile();

  const config = FILE_TYPE_CONFIGS[file.file_type as keyof typeof FILE_TYPE_CONFIGS];

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = () => {
    // Use stable API proxy URL
    window.open(`/api/files/${file.id}/view`, '_blank');
  };

  return (
    <div className="flex items-center gap-3 p-3 hover:bg-accent rounded-md border">
      <span className="text-2xl">{config?.icon || '📄'}</span>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{file.file_name}</p>
        <p className="text-sm text-muted-foreground">
          {formatBytes(file.file_size_bytes)} • {new Date(file.uploaded_at).toLocaleDateString()}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDownload}
          title="Download"
        >
          <Download className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => deleteMutation.mutate(file.id)}
          disabled={deleteMutation.isPending}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
```

**File**: `components/StorageUsageIndicator.tsx`

```typescript
'use client';

import { useGetStorageUsage } from '@/hooks/file/useGetStorageUsage';
import { Progress } from '@/components/ui/progress';

export const StorageUsageIndicator = () => {
  const { data: usage, isLoading } = useGetStorageUsage();

  if (isLoading || !usage) return null;

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(2) + ' GB';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Storage Used</span>
        <span className="font-medium">
          {formatBytes(usage.used)} / {formatBytes(usage.total)}
        </span>
      </div>
      <Progress value={usage.percentage} />
      {usage.percentage > 90 && (
        <p className="text-xs text-destructive">
          Storage almost full. Consider deleting unused files.
        </p>
      )}
    </div>
  );
};
```

#### BlockNote Image Upload Integration

**Update**: `components/RichTextEditor.tsx`

Add to the BlockNote editor configuration:

```typescript
const editor = useCreateBlockNote({
  initialContent,
  schema: BlockNoteSchema.create().extend({
    // ... existing block specs
  }),
  // NEW: Add upload handler for images
  uploadFile: async (file: File) => {
    // Validate it's an image
    if (!file.type.startsWith("image/")) {
      throw new Error("Only images can be inserted inline");
    }

    // Upload via API
    const formData = new FormData();
    formData.append("file", file);
    // Note: Images inserted inline don't have a folder association

    const response = await fetch("/api/files/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    const data = await response.json();

    // Return stable API proxy URL for BlockNote to render
    return `/api/files/${data.id}/view`;
  },
});
```

---

### 4. Update Folder Views

Update folder components to display files alongside notes:

**Example for Web**: Update `components/web/FolderWidget.tsx` or similar

```typescript
const { data: notes } = useGetNotes(folderId);
const { data: files } = useGetFiles(folderId);

return (
  <div>
    {/* Notes section */}
    <div className="space-y-2">
      {notes?.map(note => <NoteItem key={note.id} note={note} />)}
    </div>

    {/* Files section */}
    {files && files.length > 0 && (
      <div className="mt-6 space-y-2">
        <h3 className="text-sm font-semibold text-muted-foreground">Files</h3>
        {files.map(file => <FileItem key={file.id} file={file} />)}
      </div>
    )}

    {/* Upload button */}
    <UploadFileButton folderId={folderId} />

    {/* Storage usage indicator */}
    <StorageUsageIndicator />
  </div>
);
```

---

### 5. Update Constants

**File**: `CONSTANTS.ts`

Update membership features to include file uploads:

```typescript
export const MEMBERSHIP_FEATURES = {
  FREE: {
    name: "FREE",
    icon: "BrainIcon",
    color: "text-blue-600",
    features: [
      { icon: "FileText", text: "Unlimited notes and folders" },
      { icon: "Save", text: "Unlimited saving and editing" },
      { icon: "Search", text: "Search your notes" },
      { icon: "Type", text: "Rich text editing" },
      { icon: "Folder", text: "Organize with folders" },
    ],
  },
  PRO: {
    name: "PRO",
    icon: "Crown",
    color: "text-yellow-600",
    price: "$1.99",
    features: [
      { icon: "Globe", text: "Unlimited note publishing" },
      { icon: "MessageCircle", text: "Unlimited AI chat conversations" },
      { icon: "History", text: "Note versioning & history" },
      { icon: "Sparkles", text: "Advanced semantic search" },
      { icon: "Upload", text: "File uploads (1 GB storage)" }, // NEW
      { icon: "Image", text: "Insert images in notes" }, // NEW
      { icon: "FileText", text: "Upload PDFs and documents" }, // NEW
      { icon: "Crown", text: "Priority support" },
    ],
  },
} as const;
```

---

## Testing Checklist

### Backend Testing

- [ ] Upload image file (< 10MB)
- [ ] Upload PDF file (< 10MB)
- [ ] Upload text file (< 10MB)
- [ ] Reject file upload for FREE user
- [ ] Reject oversized file (> 10MB)
- [ ] Reject unsupported file type
- [ ] Enforce per-user storage quota (1 GB for PRO)
- [ ] Stream file via API proxy (`/api/files/{fileId}/view`)
- [ ] Delete file (soft delete + storage removal + update usage)
- [ ] Move file between folders (DB only)
- [ ] List files in folder
- [ ] Get storage usage stats

### Frontend Testing

- [ ] Upload file via button
- [ ] Display files in folder view
- [ ] Download file via stable API URL
- [ ] Delete file
- [ ] Insert image inline in note via BlockNote
- [ ] View storage usage indicator
- [ ] Handle upload errors gracefully
- [ ] Show loading states during upload
- [ ] Storage usage updates after upload/delete

### Integration Testing

- [ ] Upload image → insert in note → save note → reload → image still renders
- [ ] Upload file to folder → move to different folder → file still accessible
- [ ] Delete file → verify removed from storage and DB → storage usage decremented
- [ ] Reach storage quota → upload rejected with clear message
- [ ] FREE user attempts upload → blocked with upgrade prompt
- [ ] Refresh page with images → images load from stable URLs (no expiration)

---

## Future Enhancements (Post-MVP)

### Phase 2: Text Extraction & RAG Integration

- Install `pdf-parse` for PDF text extraction
- Background job to extract text from PDFs
- Chunk and embed extracted text
- Include file content in semantic search
- Chat agent can reference file content
- Show file sources in chat responses

### Phase 3: Advanced File Types

- **DOCX**: Use `mammoth` library for text extraction
- **AUDIO**: Whisper API for transcription
- **VIDEO**: Extract audio → transcribe
- **CODE**: Syntax highlighting preview
- **MARKDOWN**: Import as note

### Phase 4: Enhanced UX

- Drag & drop file upload
- Paste images from clipboard
- Image optimization with `sharp`
- Video thumbnails
- File versioning
- File sharing (separate from note sharing)
- Bulk file operations
- File preview modal

### Phase 5: Storage Management

- Storage usage dashboard page
- Visual storage breakdown by file type
- Find and delete large files
- Cleanup orphaned files
- Export all files as ZIP

---

## Success Criteria

### MVP Complete When:

- ✅ PRO users can upload images, PDFs, and text files (10MB max)
- ✅ Files appear in folder views alongside notes
- ✅ Users can download files via stable API proxy URLs
- ✅ Users can delete files (updates storage usage)
- ✅ Images can be inserted inline in notes
- ✅ Per-user storage quota (1 GB for PRO) is enforced
- ✅ FREE users see upgrade prompt when attempting upload
- ✅ File moves between folders work seamlessly
- ✅ All error cases handled gracefully
- ✅ Storage usage indicator shows current usage

---

## Notes

- **No text extraction in MVP** - Files are stored and retrieved only
- **No embedding in MVP** - RAG integration comes later
- **Images inline only** - Other file types are folder-level attachments
- **Private R2 bucket** - Security via API proxy (no signed URLs)
- **Stable URLs** - `/api/files/{fileId}/view` never expire
- **Extensible design** - Easy to add new file types later
- **PRO feature** - Drives subscription value
- **1 GB limit** - Generous for personal knowledge base use case
- **Service layer authorization** - Uses `userService.hasProAccess()`

---

## Dependencies

```json
{
  "dependencies": {
    "@aws-sdk/client-s3": "^3.x"
  }
}
```

---

## Architecture Summary

```
User uploads file
    ↓
Frontend: FormData → POST /api/files/upload
    ↓
API Route: Validates auth
    ↓
FileService:
  - Checks PRO access (userService.hasProAccess)
  - Validates file type & size
  - Checks per-user storage quota
  - Uploads to R2: {userId}/{timestamp}-{filename}
  - Creates DB record with storage_key
  - Updates user_subscription.storage_used_bytes
    ↓
Returns file metadata with id
    ↓
Frontend: Displays file in folder view
    ↓
User clicks download
    ↓
Frontend: Opens /api/files/{fileId}/view
    ↓
API Route: Validates auth & ownership
    ↓
FileService: Streams file from R2
    ↓
Browser: Receives file, caches for 1 hour
```

---

## Implementation Timeline

- **Week 1**: R2 setup, database migration, file type configs
- **Week 2**: FileService implementation, API routes (upload, view, delete)
- **Week 3**: Frontend hooks, UI components, folder view integration
- **Week 4**: BlockNote image upload, storage usage indicator, testing, polish

**Total: 4 weeks for complete MVP**

```

```
