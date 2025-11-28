import MobileHeader from "@/components/mobile/MobileHeader";
import { MobileHeaderProvider } from "@/contexts/MobileHeaderContext";

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileHeaderProvider>
      <div className="flex flex-col h-screen bg-sidebar">
        <MobileHeader />
        <div className="flex-1">{children}</div>
      </div>
    </MobileHeaderProvider>
  );
}
