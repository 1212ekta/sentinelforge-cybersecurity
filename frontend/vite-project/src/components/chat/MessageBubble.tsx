'use client';

import React from "react";
import { Copy, RefreshCw, Bot, User } from "lucide-react";
import { ChatMessage, useChat } from "@/features/chat/hooks/useChat";
import { MessageMarkdown } from "../markdown/MessageMarkdown";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { cn } from "@/utils/cn";

type Props = {
  message: ChatMessage;
};

const MessageBubble: React.FC<Props> = ({ message }) => {
  const { retryMessage } = useChat();
  const { copied, copy } = useCopyToClipboard();

  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";

  const onCopy = async () => {
    copy(message.content || "");
  };

  const onRetry = () => {
    if (isAssistant) {
      retryMessage(message.id);
    }
  };

  return (
    <div
      className={cn(
        "group flex w-full flex-col gap-1 py-3 text-sm animate-message-enter motion-reduce:animate-none",
        isUser ? "items-end" : "items-start"
      )}
      role="article"
      aria-label={`${message.role} message`}
      tabIndex={0}
    >
      <div className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
        {isUser ? (
          <User size={13} className="text-primary shrink-0" />
        ) : (
          <Bot size={13} className="text-primary shrink-0" />
        )}
        <span className="font-medium text-foreground">{isUser ? "You" : "Sentinel AI"}</span>
        <span>•</span>
        <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      <div
        className={cn(
          "relative max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 py-3 shadow-xs break-words overflow-hidden transition-all duration-150",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-xs"
            : "bg-muted/60 text-foreground border border-border rounded-tl-xs"
        )}
        aria-live={message.status === "pending" ? "polite" : undefined}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        ) : message.content ? (
          <MessageMarkdown content={message.content} />
        ) : (
          <div className="flex items-center gap-2 py-1 text-muted-foreground" aria-hidden>
            <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
            <span>Generating response…</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground min-h-[24px]">
        {isAssistant && message.status === "complete" && (
          <button
            className="flex items-center gap-1 hover:text-foreground transition-colors py-1 px-1.5 rounded-md min-h-[32px] sm:min-h-0"
            onClick={onCopy}
            aria-label="Copy message"
          >
            <Copy size={13} />
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        )}

        {message.status === "error" && (
          <div className="flex items-center gap-2 text-danger">
            <span role="alert" className="font-medium">
              {message.error || "Failed to generate"}
            </span>
            {isAssistant && (
              <button
                className="flex items-center gap-1 underline underline-offset-2 hover:text-danger/80 transition-colors py-1 px-1.5 min-h-[32px] sm:min-h-0"
                onClick={onRetry}
                aria-label="Retry message"
              >
                <RefreshCw size={13} />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}

        {message.status === "pending" && (
          <span className="text-muted-foreground animate-pulse" aria-hidden>
            Generating...
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;