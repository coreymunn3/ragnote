# Image Upload Implementation Plan

## Overview

Implement image uploads in notes via BlockNote menu with inline rendering, treating images as files in the existing `file` table for future PDF/document embedding support.

**Note**: Initial implementation focuses on menu-based upload. Drag-and-drop will be added later as an enhancement.

## Architecture Decisions

### Storage Solution

- **Choice**: Cloudflare R2 (or Supabase Storage as alternative)
- **Rationale**: Cost-effective ($0.015/GB), no egress fees, S3-compatible API

### File Management Strategy

- **Unified Approach**: Use existing `file` table for all file types (IMAGE, PDF, DOCX, AUDIO)
- **Benefits**: Single upload endpoint, consistent logic, easier RAG integration later

### BlockNote Menu Handling

- **Approach**: Override existing "Image" menu item behavior
- **Implementation**: Trigger file picker instead of URL prompt
- **User Flow**: `/` → "Image" → file picker → upload → render

## Phase 1: MVP Implementation

### Backend Tasks

#### Storage Setup

- [ ] Create Cloudflare R2 bucket (or Supabase storage bucket)
- [ ] Configure bucket CORS settings for web uploads
- [ ] Set up environment variables (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME)
- [ ] Install AWS SDK for R2: `npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`

#### Database Schema Updates

- [ ] Add migration to enhance `file` table with new fields:
  - `file_size_bytes` (Int)
  - `mime_type` (String)
  - `width` (Int, nullable, for images)
  - `height` (Int, nullable, for images)
  - `storage_key` (String, the R2 object key)
- [ ] Run migration: `npm run db:migrate`

#### File Service

- [ ] Create `services/file/fileService.ts` following service layer pattern
- [ ] Create `services/file/fileValidators.ts` with Zod schemas:
  - `uploadFileSchema` (userId, file metadata, folderId optional)
  - `deleteFileSchema` (userId, fileId)
- [ ] Create `services/file/fileTransformers.ts` for response DTOs
- [ ] Implement `FileService.uploadFile()` method:
  - Validate user subscription tier
  - Check file size limits (10MB free, 50MB pro)
  - Validate file type (image/jpeg, image/png, image/gif, image/webp)
  - Generate unique storage key (e.g., `userId/noteId/timestamp-filename`)
  - Upload to R2 using S3 SDK
  - Create record in `file` table
  - Return file URL and metadata
- [ ] Implement `FileService.deleteFile()` method:
  - Validate ownership
  - Soft delete in database (set `is_deleted = true`)
  - Optionally delete from R2 (or mark for cleanup)
- [ ] Implement `FileService.getFilesByUser()` for storage dashboard
- [ ] Add error handling with custom ApiErrors

#### API Routes

- [ ] Create `app/api/files/upload/route.ts`:
  - Handle POST requests with multipart/form-data
  - Authenticate user with Clerk
  - Parse file from FormData
  - Call `FileService.uploadFile()`
  - Return JSON response with file URL and metadata
- [ ] Create `app/api/files/[fileId]/route.ts`:
  - Handle DELETE requests
  - Authenticate user with Clerk
  - Call `FileService.deleteFile()`
  - Return success response
- [ ] Add rate limiting middleware (50 uploads per hour)

#### Type Definitions

- [ ] Create `lib/types/fileTypes.ts`:
  - `UploadFileRequest` interface
  - `UploadFileResponse` interface
  - `FileMetadata` interface
  - `FileLimits` type

### Frontend Tasks

#### Rich Text Editor Integration

- [ ] Update `components/RichTextEditor.tsx`:
  - Add `uploadFile` handler to `useCreateBlockNote` config
  - Override default "Image" block behavior to trigger file picker
  - Implement file upload logic in handler:
    - Open file picker dialog
    - Create FormData with selected file
    - Show loading state (skeleton/spinner)
    - POST to `/api/files/upload`
    - Return URL to BlockNote
    - Handle errors with toast notifications
- [ ] Test menu-based image insertion (`/` → "Image")

#### File Upload Hook

- [ ] Create `hooks/file/useUploadFile.ts`:
  - React Query mutation for file uploads
  - Progress tracking (optional for Phase 2)
  - Error handling
  - Success callbacks

#### UI Components

- [ ] Create loading skeleton component for uploading images
- [ ] Add error toast notifications (using existing toast system)
- [ ] Update file size limit messaging based on user tier

#### Type Safety

- [ ] Add TypeScript types for upload responses
- [ ] Ensure proper typing in editor upload handler

### Testing Tasks

- [ ] Test image upload flow end-to-end (web)
- [ ] Test menu-based insertion (`/` → "Image" → file picker)
- [ ] Test with different image formats (JPG, PNG, GIF, WebP)
- [ ] Test file size validation (exceed limits)
- [ ] Test tier-based restrictions (free vs pro)
- [ ] Test error scenarios (network failure, invalid file type)
- [ ] Test image rendering in published notes
- [ ] Test image persistence across note versions

## Phase 2: Mobile Support

### Mobile Tasks

- [ ] Add camera integration for iOS/Android
- [ ] Add photo library picker
- [ ] Implement mobile file upload flow
- [ ] Test camera capture → upload → render
- [ ] Test photo library selection → upload → render
- [ ] Handle mobile-specific image compression (optional)

## Phase 3: Enhanced Features

### Storage Management

- [ ] Create storage usage dashboard page
- [ ] Display total storage used vs. tier limit
- [ ] List all uploaded files with metadata
- [ ] Add bulk delete functionality
- [ ] Add "delete unused files" feature (files not in any note)

### Image Optimization

- [ ] Install Sharp: `npm install sharp`
- [ ] Add automatic image compression on upload
- [ ] Generate WebP versions for better compression
- [ ] Add lazy loading for images in editor
- [ ] Implement thumbnail generation for large images

### UX Improvements

- [ ] Add upload progress bar (0-100%)
- [ ] Add drag-and-drop support from desktop
- [ ] Add paste (Cmd+V / Ctrl+V) support for clipboard images
- [ ] Add image resize handles in editor
- [ ] Add image alignment options (left/center/right)
- [ ] Add image caption field
- [ ] Add "download original" option
- [ ] Improve error messages with actionable suggestions

### Cleanup & Maintenance

- [ ] Create cleanup job for orphaned files
- [ ] Add storage usage warnings (approaching limit)
- [ ] Implement file retention policies (optional)

## Configuration

### Environment Variables

```env
# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=wysenote-files
R2_PUBLIC_URL=https://files.wysenote.com

# Or Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### File Size Limits

```typescript
const FILE_LIMITS = {
  FREE: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxTotalStorage: 500 * 1024 * 1024, // 500MB
    allowedFormats: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  },
  PRO: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxTotalStorage: 10 * 1024 * 1024 * 1024, // 10GB
    allowedFormats: ["image/*"],
  },
};
```

## Future Considerations

### PDF & Document Support

- [ ] Extend file upload to support PDF, DOCX
- [ ] Implement file preview for non-image files
- [ ] Add text extraction for PDFs
- [ ] Integrate extracted content into RAG system
- [ ] Create file attachment UI (vs inline rendering)

### Advanced Features (Deprioritized)

- ~~Image editing (crop, rotate)~~ - Not planned
- ~~Analytics~~ - Not planned
- ~~Virus scanning~~ - Only if needed at scale
- ~~Advanced compression~~ - Only if storage becomes issue

## Success Criteria

### Phase 1 Complete When:

- ✅ User can insert images via BlockNote menu (`/` → "Image")
- ✅ File picker opens when "Image" is selected
- ✅ Images upload to R2/Supabase storage
- ✅ Images render inline immediately after upload
- ✅ File metadata stored in database
- ✅ Tier-based size limits enforced
- ✅ Error handling works gracefully
- ✅ Images persist across note saves/loads

### Phase 2 Complete When:

- ✅ Mobile users can insert photos from camera
- ✅ Mobile users can insert photos from library
- ✅ Upload flow works on iOS and Android

### Phase 3 Complete When:

- ✅ Storage dashboard shows usage metrics
- ✅ Users can manage uploaded files
- ✅ Basic image optimization implemented
- ✅ Cleanup mechanisms in place
- ✅ Drag-and-drop support added
- ✅ Paste support added

## Notes

- Images are treated as `FileType.IMAGE` in the unified `file` table
- This infrastructure will support PDF/document uploads later
- Focus on simplicity for MVP - optimization can come later
- Mobile support is essential for feature parity with Apple Notes
- **Initial implementation**: Menu-based upload only (`/` → "Image" → file picker)
- **Future enhancement**: Drag-and-drop and paste support (Phase 3)
