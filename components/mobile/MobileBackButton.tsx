"use client";
import { Button } from "../ui/button";
import { ArrowLeftIcon } from "lucide-react";

interface MobileBackButton {
  onClick: () => void;
}
const MobileBackButton = ({ onClick }: MobileBackButton) => {
  return (
    <Button variant="ghost" size="icon" onClick={onClick}>
      <ArrowLeftIcon className="h-4 w-4" />
    </Button>
  );
};
export default MobileBackButton;
