import MobileLayout from "./components/layouts/mobile/layout";
import WebLayout from "./components/layouts/web/layout";

export default function LayoutSwitch({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* render mobile layouts on small screens */}
      <div className="md:hidden">
        <MobileLayout>{children}</MobileLayout>
      </div>
      {/* render web layout on larger screens */}
      <div className="hidden md:block">
        <WebLayout>{children}</WebLayout>
      </div>
    </div>
  );
}
