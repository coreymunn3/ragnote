import WebNoteLayout from "@/app/(app)/components/layouts/web/note/layout";
import MobileNoteLayout from "@/app/(app)/components/layouts/mobile/note/layout";
import ResponsiveLayout from "@/components/ResponsiveLayout";

export default async function LayoutSwitch({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ResponsiveLayout MobileLayout={MobileNoteLayout} WebLayout={WebNoteLayout}>
      {children}
    </ResponsiveLayout>
  );
}
