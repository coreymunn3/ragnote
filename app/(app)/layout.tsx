import ClientLayoutWrapper from "./components/ClientLayoutWrapper";

export default function LayoutSwitch({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayoutWrapper>{children}</ClientLayoutWrapper>;
}
