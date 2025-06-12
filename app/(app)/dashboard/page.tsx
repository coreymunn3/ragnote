import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import WebDashboardContent from "../components/dashboard/WebDashboardContent";
import MobileDashboardContent from "../components/dashboard/MobileDashboardContent";

export default async function Dashboard() {
  const { userId } = await auth();

  // Protect this page from non-logged-in users
  if (!userId) {
    redirect("/");
  }

  return (
    <>
      {/* Mobile Dashboard Content: Visible only on small screens */}
      <div className="md:hidden">
        <MobileDashboardContent />
      </div>

      {/* Web Dashboard Content: Hidden on small screens, visible from md breakpoint and up */}
      <div className="hidden md:block">
        <WebDashboardContent />
      </div>
    </>
  );
}
