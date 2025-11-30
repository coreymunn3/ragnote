import { BrainIcon } from "lucide-react";

const BrandingHeader = () => {
  return (
    // outer div gets h-9 to ensure the dashboard's mobile header is the same height as other pages
    <div className="flex items-center w-full justify-center h-9">
      <BrainIcon className="h-6 w-6 text-primary mr-2" />
      <span className="ml-2 font-semibold">RagNote AI</span>
    </div>
  );
};
export default BrandingHeader;
