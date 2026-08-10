'use client';

import React, { useMemo } from "react";
import { Copy, RefreshCw, ShieldCheck, User, Check, Sparkles, ArrowUpRight } from "lucide-react";
import { ChatMessage, useChat } from "@/features/chat/hooks/useChat";
import { MessageMarkdown } from "../markdown/MessageMarkdown";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { generateFollowUpQuestions } from "@/features/chat/utils/followUpGenerator";
import { cn } from "@/utils/cn";

type Props = {
  message: ChatMessage;
  userPromptText?: string;
  onSelectPrompt?: (prompt: string) => void;
  isLatestAssistantMessage?: boolean;
};

const MessageBubble: React.FC<Props> = ({
  message,
  userPromptText = "",
  onSelectPrompt,
  isLatestAssistantMessage = false,
}) => {
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

  const followUpQuestions = useMemo(() => {
    if (isAssistant && message.status === "complete" && message.content) {
      return generateFollowUpQuestions(userPromptText, message.content);
    }
    return [];
  }, [isAssistant, message.status, message.content, userPromptText]);

  return (
    <div
      className={cn(
        "group flex w-full flex-col gap-1.5 py-2.5 text-xs sm:text-sm animate-message-enter motion-reduce:animate-none",
        isUser ? "items-end" : "items-start"
      )}
      role="article"
      aria-label={`${message.role} message`}
      tabIndex={0}
    >
      <div className="flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground">
        {isUser ? (
          <User size={13} className="text-primary shrink-0" />
        ) : (
          <ShieldCheck size={13} className="text-primary shrink-0" />
        )}
        <span className="font-semibold text-foreground">{isUser ? "You" : "Sentinel AI"}</span>
        <span>•</span>
        <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      <div
        className={cn(
          "relative max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 py-3 shadow-xs break-words overflow-hidden transition-all duration-150",
          isUser
            ? "bg-primary/10 text-foreground border border-primary/25 rounded-tr-xs"
            : "bg-card text-foreground border border-border rounded-tl-xs"
        )}
        aria-live={message.status === "pending" ? "polite" : undefined}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap leading-relaxed text-foreground font-normal">{message.content}</p>
        ) : message.content ? (
          <MessageMarkdown content={message.content} />
        ) : (
          <div className="flex items-center gap-2 py-1 text-muted-foreground" aria-hidden>
            <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
            <span>Analyzing security request...</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 px-1 text-[11px] text-muted-foreground min-h-[24px]">
        {isAssistant && message.status === "complete" && (
          <button
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors py-0.5 px-1.5 rounded hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
            onClick={onCopy}
            aria-label="Copy AI response"
          >
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            <span>{copied ? "Copied" : "Copy response"}</span>
          </button>
        )}

        {message.status === "error" && (
          <div className="flex items-center gap-2 text-danger">
            <span role="alert" className="font-medium">
              {message.error || "Failed to generate security response"}
            </span>
            {isAssistant && (
              <button
                className="flex items-center gap-1 underline underline-offset-2 hover:text-danger/80 transition-colors py-0.5 px-1.5 cursor-pointer"
                onClick={onRetry}
                aria-label="Retry generating message"
              >
                <RefreshCw size={12} />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}

        {message.status === "pending" && (
          <span className="text-muted-foreground animate-pulse" aria-hidden>
            Processing threat audit...
          </span>
        )}
      </div>

      {/* Contextual Explore Next Section */}
      {isAssistant && message.status === "complete" && isLatestAssistantMessage && onSelectPrompt && followUpQuestions.length > 0 && (
        <div className="w-full max-w-[90%] sm:max-w-[85%] mt-2 pt-3 border-t border-border/50 flex flex-col gap-2 animate-fade-in">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/90">
            <Sparkles size={13} className="text-primary shrink-0" />
            <span>Explore next</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
            {followUpQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => onSelectPrompt(q)}
                className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-border bg-card/80 hover:bg-muted/80 hover:border-primary/40 hover:-translate-y-0.5 transition-all text-left text-xs font-medium text-foreground cursor-pointer group shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <span className="truncate">{q}</span>
                <ArrowUpRight size={13} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;