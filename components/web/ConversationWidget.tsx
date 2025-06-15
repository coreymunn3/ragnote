import { Conversation } from "@/lib/types/conversationTypes";
import { TypographySmall } from "../ui/typgrophy";
import { MessageSquareIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface ConversationWidgetProps {
  conversation: Conversation;
}

const ConversationWidget = ({ conversation }: ConversationWidgetProps) => {
  return (
    <Card
      variant="dense"
      className="w-[300px] cursor-pointer hover:shadow-md hover:text-primary transition-all duration-200"
    >
      <CardHeader>
        <CardTitle className="text-base font-semibold line-clamp-1 overflow-ellipsis">
          {conversation.title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex items-center text-muted-foreground">
          <MessageSquareIcon className="h-4 w-4 mr-1.5" />
          <TypographySmall>
            {conversation.messages_count} messages
          </TypographySmall>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationWidget;
