# System Folders Implementation Guide

## Overview

System folders are virtual folders that don't exist in the database but provide a unified interface for grouping special collections of items (notes or chats). Unlike user-created folders, system folders are automatically available to all users and serve specific purposes like "Recently Deleted", "Chats", or "Shared With You".

## Architecture

System folders follow this key principle: **They are not real database records**, but virtual groupings that reuse the same UI components as regular folders.

### Key Components

1. **Type Definitions** (`lib/types/folderTypes.ts`)
2. **Utility Functions** (`lib/utils/folderUtils.ts`)
3. **Icon Mapping** (`lib/utils.tsx`)
4. **Folder Service** (`services/folder/folderService.ts`)
5. **Item Retrieval Logic** (`services/note/noteService.ts` or `services/chat/chatService.ts`)

## How to Add a New System Folder

### Step 1: Define the System Folder

**File:** `lib/types/folderTypes.ts`

Add your new folder to the `SYSTEM_FOLDERS` constant and update the `SystemFolderId` type:

```typescript
export const SYSTEM_FOLDERS = {
  // Existing folders...
  YOUR_FOLDER: {
    id: "system_your_folder", // Must start with "system_"
    displayName: "Your Folder Display Name",
  },
};

export type SystemFolderId =
  | "system_deleted"
  | "system_chats"
  | "system_your_folder"; // Add your folder's ID
```

**Important Naming Conventions:**

- ID must start with `"system_"` prefix
- Use snake_case for the ID
- Use PascalCase for the key in SYSTEM_FOLDERS
- Display name is shown to users in the UI

---

### Step 2: Add Switch Case to Utility Function

**File:** `lib/utils/folderUtils.ts`

Add a case in `getSystemFolderKey()` to map your folder ID to its key:

```typescript
export function getSystemFolderKey(
  systemFolderId: string
): keyof typeof SYSTEM_FOLDERS {
  switch (systemFolderId) {
    case SYSTEM_FOLDERS.DELETED.id:
      return "DELETED";
    case SYSTEM_FOLDERS.CHATS.id:
      return "CHATS";
    case SYSTEM_FOLDERS.YOUR_FOLDER.id: // Add this
      return "YOUR_FOLDER";
    default:
      throw new NotFoundError(`Unknown system folder: ${systemFolderId}`);
  }
}
```

---

### Step 3: Add Icon Mapping

**File:** `lib/utils.tsx`

Add a case in `getFolderIcon()` to define which icon represents your folder:

```typescript
export const getFolderIcon = (folderId: string) => {
  switch (folderId) {
    case "system_deleted":
      return <Trash2Icon className="h-4 w-4" />;
    case "system_chats":
      return <MessageSquare className="h-4 w-4" />;
    case "system_your_folder":  // Add this
      return <YourIcon className="h-4 w-4" />;  // Import icon at top
    case "home":
      return <HouseIcon className="h-4 w-4" />;
    default:
      return <FolderIcon className="h-4 w-4" />;
  }
};
```

---

### Step 4: Add Folder to System Folders List

**File:** `services/folder/folderService.ts`

In the `getUserSystemFolders()` method, create and add your folder to the returned array:

```typescript
public getUserSystemFolders = withErrorHandling(
  async (userId: string): Promise<FolderWithItems[]> => {
    // Handle each system folder separately since they need different enrichment types
    const deletedFolder = await this.enrichFoldersWithItems(
      [this.createSystemFolder("DELETED", userId)],
      userId,
      "note"  // or "chat" depending on item type
    );

    const chatsFolder = await this.enrichFoldersWithItems(
      [this.createSystemFolder("CHATS", userId)],
      userId,
      "chat"
    );

    // Add your new folder
    const yourFolder = await this.enrichFoldersWithItems(
      [this.createSystemFolder("YOUR_FOLDER", userId)],
      userId,
      "note"  // or "chat" - specify what type of items this folder contains
    );

    // Add yourFolder to the return array
    return [...chatsFolder, ...yourFolder, ...deletedFolder];
  }
);
```

**Note:** The order in the return array determines the display order in the UI.

---

### Step 5: Implement Item Retrieval Logic

This step varies depending on whether your folder contains notes or chats.

#### For Note-Based Folders

**File:** `services/note/noteService.ts`

1. Add a case in `getSystemFolderNotes()`:

```typescript
private async getSystemFolderNotes(
  systemFolderId: string,
  userId: string
): Promise<Note[]> {
  switch (systemFolderId) {
    case SYSTEM_FOLDERS.DELETED.id:
      return await this.getDeletedNotes(userId);

    case SYSTEM_FOLDERS.YOUR_FOLDER.id:  // Add this
      return await this.getYourFolderNotes(userId);

    default:
      throw new NotFoundError(`Unknown system folder: ${systemFolderId}`);
  }
}
```

2. Implement the retrieval method:

```typescript
public getYourFolderNotes = withErrorHandling(
  async (userId: string): Promise<Note[]> => {
    const { userId: validatedUserId } = userIdSchema.parse({ userId });

    // Query notes based on your folder's criteria
    const notes = await prisma.note.findMany({
      where: {
        // Your custom query logic here
        user_id: validatedUserId,
        // Add specific conditions for your folder
      },
      include: {
        current_version: true,
        _count: {
          select: {
            permissions: true,
          },
        },
      },
    });

    // Enrich with previews
    const notesWithPreviews = await this.enrichNotesWithPreviews(notes);

    // Transform and return
    return notesWithPreviews.map((note) => transformToNote(note));
  }
);
```

#### For Chat-Based Folders

If your folder displays chats instead of notes, implement similar logic in `services/chat/chatService.ts`.

---

### Step 6: Update getFolderById (if needed)

**File:** `services/folder/folderService.ts`

The `getFolderById()` method already handles system folders generically, but if your folder needs special handling, you may need to update the item type determination:

```typescript
// Determine item type based on system folder
const itemType: FolderItemType =
  systemFolderKey === "CHATS"
    ? "chat"
    : systemFolderKey === "YOUR_FOLDER"
      ? "chat" // if yours uses chats
      : "note";
```

---

## Complete Example: Re-enabling Shared Notes

Here's a complete example showing how to re-enable the shared notes system folder:

### 1. Uncomment type definitions

```typescript
// lib/types/folderTypes.ts
export const SYSTEM_FOLDERS = {
  SHARED: {
    id: "system_shared",
    displayName: "Shared With You",
  },
  // ... other folders
};

export type SystemFolderId =
  | "system_shared"
  | "system_deleted"
  | "system_chats";
```

### 2. Uncomment utility function

```typescript
// lib/utils/folderUtils.ts
case SYSTEM_FOLDERS.SHARED.id:
  return "SHARED";
```

### 3. Uncomment icon mapping

```typescript
// lib/utils.tsx
case "system_shared":
  return <FolderSyncIcon className="h-4 w-4" />;
```

### 4. Uncomment and add to folder service

```typescript
// services/folder/folderService.ts
const sharedFolder = await this.enrichFoldersWithItems(
  [this.createSystemFolder("SHARED", userId)],
  userId,
  "note"
);

return [...chatsFolder, ...sharedFolder, ...deletedFolder];
```

### 5. Uncomment note retrieval logic

```typescript
// services/note/noteService.ts
case SYSTEM_FOLDERS.SHARED.id:
  return await this.getSharedNotes(userId);
```

The `getSharedNotes()` method already exists, so no additional implementation needed!

---

## Important Notes

### ID Validation

System folder IDs are validated by the `isSystemFolder()` utility function:

```typescript
export function isSystemFolder(folderId: string): folderId is SystemFolderId {
  return folderId.startsWith("system_");
}
```

All system folder IDs **must** start with `"system_"`.

### Type Safety

TypeScript will help ensure you've covered all cases:

- The `getSystemFolderKey()` return type is `keyof typeof SYSTEM_FOLDERS`
- This means TypeScript will error if you forget to add a case in switch statements
- The `SystemFolderId` type union ensures type safety across the codebase

### Performance Considerations

- System folders are created on-the-fly for each request
- The `enrichFoldersWithItems()` method fetches all items for the folder
- For folders with many items, consider implementing pagination

### URL Routing

System folders use the same URL pattern as regular folders:

- URL format: `/folder/system_your_folder`
- The `getFolderById()` method handles both system and regular folders
- No special routing configuration needed

---

## Troubleshooting

### Error: "Unknown system folder"

- Verify you added the case in `getSystemFolderKey()` switch statement
- Ensure the ID matches exactly between all files
- Check that the ID starts with `"system_"`

### TypeScript Errors

- Make sure you updated the `SystemFolderId` type union
- Verify all switch statements are exhaustive
- Check that imports are correct

### Folder Not Appearing in UI

- Confirm you added the folder to the return array in `getUserSystemFolders()`
- Check that the enrichment is using the correct item type ("note" or "chat")
- Verify the retrieval method is properly implemented

### Empty Folder

- Check the database query logic in your retrieval method
- Verify user permissions are correctly handled
- Test the query directly in Prisma Studio or psql

---

## Best Practices

1. **Always use TODO comments** when temporarily disabling folders:

   ```typescript
   // TODO: Re-enable for shared notes feature
   ```

2. **Comment out instead of deleting** for features that may return:

   - Preserves implementation details
   - Faster to re-enable
   - Maintains git history

3. **Keep display names user-friendly**:

   - Use title case: "Shared With You" not "shared with you"
   - Be descriptive: "Recently Deleted" not just "Deleted"

4. **Consider ordering carefully**:

   - Most frequently used folders first
   - Related folders grouped together
   - Special folders (like trash) typically last

5. **Test thoroughly**:
   - Test with empty folders
   - Test with many items
   - Test permissions (if applicable)
   - Test on both web and mobile views

---

## Files Checklist

When adding a new system folder, you'll touch these files:

- [ ] `lib/types/folderTypes.ts` - Add folder definition and type
- [ ] `lib/utils/folderUtils.ts` - Add switch case
- [ ] `lib/utils.tsx` - Add icon mapping
- [ ] `services/folder/folderService.ts` - Add to getUserSystemFolders()
- [ ] `services/note/noteService.ts` or `services/chat/chatService.ts` - Implement retrieval logic
- [ ] Test the implementation

---

## Additional Resources

- See existing system folders (DELETED, CHATS) as reference implementations
- Check `services/note/noteService.ts` for the complete `getSharedNotes()` implementation
- Review `services/folder/folderService.ts` for the folder enrichment pattern
