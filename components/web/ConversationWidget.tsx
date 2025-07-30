import { ChatSession } from "@/lib/types/chatTypes";
import { TypographySmall } from "../ui/typography";
import { MessageSquareIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface ConversationWidgetProps {
  chatSession: ChatSession;
}

const ConversationWidget = ({ chatSession }: ConversationWidgetProps) => {
  return (
    <Card
      variant="dense"
      className="w-[300px] cursor-pointer hover:shadow-md hover:text-primary transition-all duration-200"
    >
      <CardHeader>
        <CardTitle className="text-base font-semibold line-clamp-1 overflow-ellipsis">
          {chatSession.title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex items-center text-muted-foreground">
          <MessageSquareIcon className="h-4 w-4 mr-1.5" />
          <TypographySmall>
            {chatSession.messages_count} messages
          </TypographySmall>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationWidget;
