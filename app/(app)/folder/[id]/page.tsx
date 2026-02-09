import { notFound } from "next/navigation";
import MobileFolderPageContent from "../../components/Folder/MobileFolderPageContent";
import WebFolderPageContent from "../../components/Folder/WebFolderPageContent";
import ResponsivePage from "@/components/ResponsivePage";
import { FolderService } from "@/services/folder/folderService";
import { getDbUser } from "@/lib/getDbUser";

export default async function FolderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const folderService = new FolderService();

  // Await params before using
  const { id } = await params;
  const dbUser = await getDbUser();

  // get the folder - initial data for folder page
  let folder = null;
  try {
    folder = await folderService.getFolderById(id, dbUser.id);
  } catch (error) {
    // If we're offline and can't fetch, we'll return null for placeholderData
    // and let the client-side query handle it (potentially using cache)
    console.error("Failed to fetch folder server-side:", error);
    // Don't notFound() here, as we want to try client-side fetch/cache
  }

  // Render each view component
  const mobileView = (
    <MobileFolderPageContent folderId={id} initialFolder={folder} />
  );
  const webView = <WebFolderPageContent folderId={id} initialFolder={folder} />;

  return <ResponsivePage mobileView={mobileView} webView={webView} />;
}
