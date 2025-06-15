import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import MobileNotePageContent from "../../components/Note/MobileNotePageContent";
import WebNotePageContent from "../../components/Note/WebNotePageContent";
import ResponsiveView from "@/components/ResponsiveView";

export default async function NotePage() {
  const { userId } = await auth();

  // Protect this page from non-logged-in users
  if (!userId) {
    redirect("/");
  }

  const mobileView = <MobileNotePageContent />;
  const webView = <WebNotePageContent />;

  return <ResponsiveView mobileView={mobileView} webView={webView} />;
}
