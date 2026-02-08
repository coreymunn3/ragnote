import WebRecentlyDeletedContent from "../components/RecentlyDeleted/WebRecentlyDeletedContent";
import MobileRecentlyDeletedContent from "../components/RecentlyDeleted/MobileRecentlyDeletedContent";
import ResponsivePage from "@/components/ResponsivePage";
import { getDbUser } from "@/lib/getDbUser";
import { DeletedItemsService } from "@/services/deleted/deletedItemsService";
import { DeletedItemsCollection } from "@/lib/types/deletedTypes";

export default async function RecentlyDeletedPage() {
  const deletedItemsService = new DeletedItemsService();

  // get the deleted items
  let deletedItems: DeletedItemsCollection = {
    notes: [],
    folders: [],
    chats: [],
    counts: { notes: 0, folders: 0, chats: 0, total: 0 },
  };

  try {
    const dbUser = await getDbUser();
    deletedItems = await deletedItemsService.getDeletedItems(dbUser.id);
  } catch (error) {
    console.error("Failed to fetch deleted items server-side:", error);
    // deletedItems already initialized with empty data
  }

  // Render each view component
  const mobileView = (
    <MobileRecentlyDeletedContent deletedItems={deletedItems} />
  );
  const webView = <WebRecentlyDeletedContent deletedItems={deletedItems} />;

  return <ResponsivePage mobileView={mobileView} webView={webView} />;
}
