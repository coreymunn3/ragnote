import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
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
  const { userId } = await auth();
  const folderService = new FolderService();

  // Await params before using
  const { id } = await params;

  // Protect this page from non-logged-in users
  if (!userId) {
    redirect("/");
  }
  // get the database user
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
