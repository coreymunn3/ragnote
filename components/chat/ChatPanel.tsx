import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

interface ChatPanelProps {
  open: boolean;
  onOpenChange: () => void;
  title: string;
  isMobile?: boolean;
}

const ChatPanel = ({
  open,
  onOpenChange,
  title,
  isMobile = false,
}: ChatPanelProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] flex flex-col" side={"right"}>
        <SheetHeader>
          <SheetTitle>{title} Chat</SheetTitle>
          <SheetDescription>
            {`Ask anything about ${title} below, and manage past conversations`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-scroll"></div>
      </SheetContent>
    </Sheet>
  );
};
export default ChatPanel;
