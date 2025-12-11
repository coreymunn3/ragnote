import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import WebNoteLayout from "@/app/(app)/components/layouts/web/note/layout";
import MobileNoteLayout from "@/app/(app)/components/layouts/mobile/note/layout";
import ResponsiveLayout from "@/components/ResponsiveLayout";

export default async function LayoutSwitch({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  // Protect this page from non-logged-in users
  if (!userId) {
    redirect("/");
  }

  return (
    <ResponsiveLayout MobileLayout={MobileNoteLayout} WebLayout={WebNoteLayout}>
      {children}
    </ResponsiveLayout>
  );
}
