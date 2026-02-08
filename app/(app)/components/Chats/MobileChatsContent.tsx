"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import MobileList from "@/components/mobile/MobileList";
import { useGetChatSessionsForUser } from "@/hooks/chat/useGetChatSessionsForUser";
import { ChatSession } from "@/lib/types/chatTypes";
import { useMobileHeader } from "@/contexts/MobileHeaderContext";
import MobileBackButton from "@/components/mobile/MobileBackButton";
import MobilePageTitle from "@/components/mobile/MobilePageTitle";

interface MobileChatsContentProps {
  chatSessions: ChatSession[];
}

const MobileChatsContent = ({ chatSessions }: MobileChatsContentProps) => {
  const router = useRouter();
  const { setHeaderConfig, resetHeaderConfig } = useMobileHeader();

  // Set header configuration for Chats page
  useEffect(() => {
    setHeaderConfig({
      leftContent: (
        <MobileBackButton onClick={() => router.push("/dashboard")} />
      ),
      rightContent: <MobilePageTitle title="Chats" />,
    });

    return () => {
      resetHeaderConfig();
    };
  }, [setHeaderConfig, resetHeaderConfig, router]);

  // re-fetch the user's chat sessions
  const userChatSessions = useGetChatSessionsForUser({
    initialData: chatSessions,
  });

  // Sort chat sessions by last updated time
  const sortedChats =
    userChatSessions.data?.sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    ) || [];

  return (
    <div className="flex flex-col space-y-4">
      <MobileList
        title="All Chats"
        items={sortedChats}
        type="chat"
        isLoading={userChatSessions.isLoading}
        emptyContentMessage="No chats yet. Chat with one of your notes to get started."
      />
    </div>
  );
};
export default MobileChatsContent;
