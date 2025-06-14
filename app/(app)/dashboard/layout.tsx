export default function WebDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="container p-4 max-w-4xl mx-auto">{children}</div>;
}
