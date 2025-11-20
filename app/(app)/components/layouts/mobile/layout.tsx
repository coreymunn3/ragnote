import MobileHeader from "@/components/mobile/MobileHeader";

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-sidebar">
      <MobileHeader />
      {children}
    </div>
  );
}
