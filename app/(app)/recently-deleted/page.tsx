import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import WebRecentlyDeletedContent from "../components/RecentlyDeleted/WebRecentlyDeletedContent";
import MobileRecentlyDeletedContent from "../components/RecentlyDeleted/MobileRecentlyDeletedContent";
import ResponsivePage from "@/components/ResponsivePage";
import { getDbUser } from "@/lib/getDbUser";
import { DeletedItemsService } from "@/services/deleted/deletedItemsService";

export default async function RecentlyDeletedPage() {
  const { userId } = await auth();
  const deletedItemsService = new DeletedItemsService();

  // Protect this page from non-logged-in users
  if (!userId) {
    redirect("/");
  }

  // get the database user
  const dbUser = await getDbUser();

  // get the deleted items
  let deletedItems;
  try {
    deletedItems = await deletedItemsService.getDeletedItems(dbUser.id);
  } catch (error) {
    console.error(error);
    // Initialize with empty data if fetch fails
    deletedItems = {
      notes: [],
      folders: [],
      chats: [],
      counts: { notes: 0, folders: 0, chats: 0, total: 0 },
    };
  }

  // Render each view component
  const mobileView = (
    <MobileRecentlyDeletedContent deletedItems={deletedItems} />
  );
  const webView = <WebRecentlyDeletedContent deletedItems={deletedItems} />;

  return <ResponsivePage mobileView={mobileView} webView={webView} />;
}
