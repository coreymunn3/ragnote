import { SYSTEM_FOLDERS, SystemFolderId } from "@/lib/types/folderTypes";
import { NotFoundError } from "@/lib/errors/apiErrors";

/**
 * Determines if a folder ID represents a system folder
 * @param folderId - The folder ID to check
 * @returns True if the folder ID is a system folder
 */
export function isSystemFolder(folderId: string): folderId is SystemFolderId {
  return folderId.startsWith("system_");
}

/**
 * Maps system folder ID to SYSTEM_FOLDERS key
 * @param systemFolderId - The system folder ID
 * @returns The corresponding key from SYSTEM_FOLDERS
 */
export function getSystemFolderKey(
  systemFolderId: string
): keyof typeof SYSTEM_FOLDERS {
  switch (systemFolderId) {
    // TODO: Re-enable for shared notes feature
    // case SYSTEM_FOLDERS.SHARED.id:
    //   return "SHARED";
    case SYSTEM_FOLDERS.DELETED.id:
      return "DELETED";
    case SYSTEM_FOLDERS.CHATS.id:
      return "CHATS";
    default:
      throw new NotFoundError(`Unknown system folder: ${systemFolderId}`);
  }
}
