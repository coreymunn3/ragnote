import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import MobileFolderPageContent from "../../components/Folder/MobileFolderPageContent";
import WebFolderPageContent from "../../components/Folder/WebFolderPageContent";
import ResponsiveView from "@/components/ResponsiveView";
import { FolderService } from "@/services/folder/folderService";
import { getDbUser } from "@/lib/getDbUser";

export default async function FolderPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();
  const folderService = new FolderService();

  // Protect this page from non-logged-in users
  if (!userId) {
    redirect("/");
  }
  // get the database user
  const dbUser = await getDbUser();
  // get the folder
  const folder = await folderService.getFolderById(params.id, dbUser.id);

  // Render each view component
  const mobileView = <MobileFolderPageContent folder={folder} />;
  const webView = <WebFolderPageContent folder={folder} />;

  return <ResponsiveView mobileView={mobileView} webView={webView} />;
}
