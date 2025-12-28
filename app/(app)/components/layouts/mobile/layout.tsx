import MobileHeader from "@/components/mobile/MobileHeader";
import { MobileHeaderProvider } from "@/contexts/MobileHeaderContext";
import BackgroundPattern from "@/components/BackgroundPattern";

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileHeaderProvider>
      <div className="flex flex-col h-screen bg-sidebar relative">
        <BackgroundPattern />
        <MobileHeader />
        <div className="flex-1 relative z-10">{children}</div>
      </div>
    </MobileHeaderProvider>
  );
}
