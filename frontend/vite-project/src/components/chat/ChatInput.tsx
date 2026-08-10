'use client';

import React, { useEffect, useRef, useState } from "react";
import { SendHorizontal, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

type ChatInputProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
  isSending?: boolean;
  placeholder?: string;
};

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  isSending = false,
  placeholder,
}) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const isInputDisabled = disabled || isSending;

  useEffect(() => {
    if (!isInputDisabled) {
      textareaRef.current?.focus();
    }
  }, [isInputDisabled]);

  const submit = () => {
    const text = value.trim();
    if (!text || isInputDisabled) return;
    onSend(text);
    setValue("");
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isInputDisabled) {
        submit();
      }
    }
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="relative flex w-full items-end gap-2 rounded-xl border border-border bg-background p-2 shadow-xs transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20">
        <label htmlFor="chat-input" className="sr-only">
          Message input
        </label>
        <textarea
          id="chat-input"
          ref={textareaRef}
          className={cn(
            "min-h-[44px] max-h-32 flex-1 resize-none bg-transparent px-2.5 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70",
            "focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
          )}
          placeholder={placeholder || "Ask SentinelForge about vulnerabilities, code audits, or threat remediation..."}

          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isInputDisabled}
          aria-disabled={isInputDisabled}
          aria-label="Chat message input"
          rows={1}
        />
        <button
          onClick={submit}
          disabled={isInputDisabled || value.trim().length === 0}
          aria-disabled={isInputDisabled || value.trim().length === 0}
          aria-label="Send message"
          className={cn(
            "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-medium transition-all shadow-xs cursor-pointer",
            "hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "disabled:pointer-events-none disabled:opacity-40"
          )}
        >
          {isSending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <SendHorizontal size={16} />
          )}
        </button>
      </div>

      <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground/80">
        <span>Enter to send · Shift + Enter for newline</span>
        {value.length > 0 && (
          <span className="font-mono text-[10px]">{value.length} chars</span>
        )}
      </div>

    </div>
  );
};

export default React.memo(ChatInput);