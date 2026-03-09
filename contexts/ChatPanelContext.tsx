"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ChatScope } from "@/lib/types/chatTypes";
import ChatPanel from "@/components/chat/ChatPanel";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatPanelState {
  isOpen: boolean;
  scope?: ChatScope;
  scopeId?: string;
  title?: string;
  initialMessage?: string;
}

interface ChatPanelContextType {
  openPanel: (
    scope: ChatScope,
    scopeId: string | undefined,
    title: string,
    initialMessage?: string,
  ) => void;
  closePanel: () => void;
  isOpen: boolean;
}

const ChatPanelContext = createContext<ChatPanelContextType | undefined>(
  undefined,
);

export const useChatPanel = () => {
  const context = useContext(ChatPanelContext);
  if (!context) {
    throw new Error("useChatPanel must be used within ChatPanelProvider");
  }
  return context;
};

interface ChatPanelProviderProps {
  children: ReactNode;
}

export const ChatPanelProvider = ({ children }: ChatPanelProviderProps) => {
  const isMobile = useIsMobile();
  const [panelState, setPanelState] = useState<ChatPanelState>({
    isOpen: false,
  });

  const openPanel = (
    scope: ChatScope,
    scopeId: string | undefined,
    title: string,
    initialMessage?: string,
  ) => {
    setPanelState({
      isOpen: true,
      scope,
      scopeId,
      title,
      initialMessage,
    });
  };

  const closePanel = () => {
    setPanelState((prev) => ({
      ...prev,
      isOpen: false,
      initialMessage: undefined, // Clear initial message when closing
    }));
  };

  return (
    <ChatPanelContext.Provider
      value={{ openPanel, closePanel, isOpen: panelState.isOpen }}
    >
      {children}
      {/* Render the single ChatPanel instance */}
      {panelState.scope && (
        <ChatPanel
          open={panelState.isOpen}
          onOpenChange={closePanel}
          title={panelState.title || "Chat"}
          isMobile={isMobile}
          scope={panelState.scope}
          scopeId={panelState.scopeId}
          initialMessage={panelState.initialMessage}
        />
      )}
    </ChatPanelContext.Provider>
  );
};
