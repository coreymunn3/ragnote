import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import MobileFolderPageContent from "../../components/Folder/MobileFolderPageContent";
import WebFolderPageContent from "../../components/Folder/WebFolderPageContent";
import ResponsiveView from "@/components/ResponsiveView";

export default async function FolderPage() {
  const { userId } = await auth();

  // Protect this page from non-logged-in users
  if (!userId) {
    redirect("/");
  }

  // Render each view component
  const mobileView = <MobileFolderPageContent />;
  const webView = <WebFolderPageContent />;

  return <ResponsiveView mobileView={mobileView} webView={webView} />;
}
