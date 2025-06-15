import WebNoteLayout from "../../components/layouts/web/note/layout";
import MobileNoteLayout from "../../components/layouts/mobile/note/layout";
import ResponsiveLayout from "@/components/ResponsiveLayout";

export default function LayoutSwitch({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <ResponsiveLayout
        MobileLayout={MobileNoteLayout}
        WebLayout={WebNoteLayout}
      >
        {children}
      </ResponsiveLayout>
    </div>
  );
}
