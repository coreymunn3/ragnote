import { BrainIcon } from "lucide-react";

const BrandingHeader = () => {
  return (
    <div className="flex items-center w-full justify-center">
      <BrainIcon className="h-6 w-6 text-primary mr-2" />
      <span className="ml-2 text-lg font-semibold">RagNote AI</span>
    </div>
  );
};
export default BrandingHeader;
