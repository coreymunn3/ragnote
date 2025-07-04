import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import WebDashboardContent from "../components/Dashboard/WebDashboardContent";
import MobileDashboardContent from "../components/Dashboard/MobileDashboardContent";
import ResponsiveView from "@/components/ResponsiveView";

export default async function Dashboard() {
  const { userId } = await auth();

  // Protect this page from non-logged-in users
  if (!userId) {
    redirect("/");
  }

  // Render each view component
  const mobileView = <MobileDashboardContent />;
  const webView = <WebDashboardContent />;

  return <ResponsiveView mobileView={mobileView} webView={webView} />;
}
