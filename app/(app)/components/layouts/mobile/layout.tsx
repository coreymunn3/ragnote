import MobileHeader from "@/components/mobile/MobileHeader";

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen bg-sidebar">
      <MobileHeader />
      <div className="flex-1">{children}</div>
    </div>
  );
}
