import WebChatsContent from "../components/Chats/WebChatsContent";
import MobileChatsContent from "../components/Chats/MobileChatsContent";
import ResponsivePage from "@/components/ResponsivePage";

export default function ChatsPage() {
  // Render each view component - data fetching now happens client-side
  const mobileView = <MobileChatsContent />;
  const webView = <WebChatsContent />;

  return <ResponsivePage mobileView={mobileView} webView={webView} />;
}
