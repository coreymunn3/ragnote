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
  let folder;
  try {
    folder = await folderService.getFolderById(id, dbUser.id);
  } catch (error) {
    console.error(error);
    notFound();
  }

  // Render each view component
  const mobileView = <MobileFolderPageContent folder={folder} />;
  const webView = <WebFolderPageContent folder={folder} />;

  return <ResponsivePage mobileView={mobileView} webView={webView} />;
}
