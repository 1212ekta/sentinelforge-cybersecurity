'use client';

import React from "react";
import { Square } from "lucide-react";
import { useChat } from "@/features/chat/hooks/useChat";
import { useChatHistory } from "@/features/chat/hooks/useChatHistory";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import { cn } from "@/utils/cn";

type ChatWindowProps = {
  className?: string;
  darkMode?: boolean;
  sendMessageHandler?: Parameters<typeof useChat>[0] extends { sendMessageHandler?: infer T }
    ? T
    : never;
};

const ChatWindow: React.FC<ChatWindowProps> = ({ className, darkMode, sendMessageHandler }) => {
  const { activeConversation, updateActiveMessages } = useChatHistory();
  const chat = useChat({
    sendMessageHandler,
    initialMessages: activeConversation?.messages || [],
    conversationId: activeConversation?.id,
    onMessagesChange: updateActiveMessages,
  });

  const pendingMessage =
    chat.messages.find((message) => message.role === "assistant" && message.status === "pending") ?? null;

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden bg-background text-foreground",
        className
      )}
      data-theme={typeof darkMode === "boolean" ? (darkMode ? "dark" : "light") : undefined}
      role="region"
      aria-label="Chat window"
    >
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
        <h2 className="truncate text-sm sm:text-base font-semibold text-foreground">
          {activeConversation?.title || "Chat"}
        </h2>
        <div className="flex items-center gap-2">
          {chat.isSending && (
            <button
              onClick={() => chat.stopGenerating()}
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-muted/50 px-3 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Stop generation"
              title="Stop generation"
            >
              <Square size={12} className="fill-foreground" />
              <span>Stop</span>
            </button>
          )}
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-hidden p-3 sm:p-4">
        <MessageList
          messages={chat.messages}
          onSelectPrompt={(text: string) => chat.sendMessage(text)}
        />
        {pendingMessage && (
          <div className="mt-2 shrink-0">
            <TypingIndicator message={pendingMessage} />
          </div>
        )}
      </main>

      <footer className="shrink-0 border-t border-border bg-background p-3 sm:p-4">
        <ChatInput
          disabled={chat.isSending}
          isSending={chat.isSending}
          onSend={(t: string) => chat.sendMessage(t)}
        />
      </footer>
    </div>
  );
};

export default React.memo(ChatWindow);