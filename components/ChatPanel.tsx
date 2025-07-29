import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";

interface ChatPanelProps {
  open: boolean;
  onOpenChange: () => void;
  isMobile?: boolean;
}

const ChatPanel = ({
  open,
  onOpenChange,
  isMobile = false,
}: ChatPanelProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px]" side={"right"}>
        <SheetHeader>
          <SheetTitle>Chat With Your Note</SheetTitle>
          <SheetDescription>
            Begin by asking a question below, then carry on the conversation
            naturally
          </SheetDescription>
        </SheetHeader>
        <div>
          <Button>Do something!</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
export default ChatPanel;
