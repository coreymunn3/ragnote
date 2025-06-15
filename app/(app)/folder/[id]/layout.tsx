import WebFolderLayout from "../../components/layouts/web/folder/layout";
import MobileFolderLayout from "../../components/layouts/mobile/folder/layout";
import ResponsiveLayout from "../../../../components/ResponsiveLayout";

const FolderPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ResponsiveLayout
      MobileLayout={MobileFolderLayout}
      WebLayout={WebFolderLayout}
    >
      {children}
    </ResponsiveLayout>
  );
};
export default FolderPageLayout;
