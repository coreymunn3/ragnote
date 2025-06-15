import MobileHeader from "../MobileHeader";

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <MobileHeader />
      {children}
    </div>
  );
}
