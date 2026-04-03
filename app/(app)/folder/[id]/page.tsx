import MobileFolderPageContent from "../../components/Folder/MobileFolderPageContent";
import WebFolderPageContent from "../../components/Folder/WebFolderPageContent";
import ResponsivePage from "@/components/ResponsivePage";

export default async function FolderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await params before using
  const { id } = await params;

  // Render each view component - data fetching now happens client-side
  const mobileView = <MobileFolderPageContent folderId={id} />;
  const webView = <WebFolderPageContent folderId={id} />;

  return <ResponsivePage mobileView={mobileView} webView={webView} />;
}
