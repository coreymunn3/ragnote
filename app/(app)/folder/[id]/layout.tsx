import WebFolderLayout from "../../(web_layout)/folder/layout";
import MobileFolderLayout from "../../(mobile_layout)/folder/layout";

const FolderPageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {/* render mobile layouts on small screens */}
      <div className="md:hidden">
        <MobileFolderLayout>{children}</MobileFolderLayout>
      </div>
      {/* render web layout on larger screens */}
      <div className="hidden md:block">
        <WebFolderLayout>{children}</WebFolderLayout>
      </div>
    </>
  );
};
export default FolderPageLayout;
