import MobileLayout from "./components/layouts/mobile/layout";
import WebLayout from "./components/layouts/web/layout";
import ResponsiveLayout from "../../components/ResponsiveLayout";

export default function LayoutSwitch({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <ResponsiveLayout MobileLayout={MobileLayout} WebLayout={WebLayout}>
        {children}
      </ResponsiveLayout>
    </div>
  );
}
