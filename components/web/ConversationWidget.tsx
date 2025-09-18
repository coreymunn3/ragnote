import { ChatSession } from "@/lib/types/chatTypes";
import { TypographyMuted, TypographySmall } from "../ui/typography";
import { MessageSquareIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
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
      </CardHeader>

      <CardContent>
        <TypographyMuted className="line-clamp-2 overflow-ellipsis h-10">
          {chatSession.preview}
        </TypographyMuted>
      </CardContent>

      <CardFooter>
        <div className="flex justify-between w-full">
          {/* number of messages in this session */}
          <div className="flex items-center text-muted-foreground">
            <MessageSquareIcon className="h-4 w-4 mr-1.5" />
            <TypographySmall>
              {chatSession.messages_count} messages
            </TypographySmall>
          </div>
          {/* last updated */}
          <div className="flex items-center text-muted-foreground">
            <TypographySmall>
              {DateTime.fromISO(chatSession.updated_at).toRelative()}
            </TypographySmall>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ConversationWidget;
