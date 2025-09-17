import { ChatSession } from "@/lib/types/chatTypes";
import { TypographySmall } from "../ui/typography";
import { MessageSquareIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DateTime } from "luxon";

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
        <TypographySmall className="overflow-ellipsis">
          {chatSession.preview}
        </TypographySmall>
      </CardHeader>

      <CardContent>
        <div className="flex justify-between w-full text-muted-foreground">
          {/* number of messages in this session */}
          <div className="flex items-center">
            <MessageSquareIcon className="h-4 w-4 mr-1.5" />
            <TypographySmall>
              {chatSession.messages_count} messages
            </TypographySmall>
          </div>
          {/* last  */}
          <div>
            <TypographySmall>
              {DateTime.fromISO(chatSession.updated_at).toRelative()}
            </TypographySmall>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationWidget;
