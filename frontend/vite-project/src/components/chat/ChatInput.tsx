'use client';

import React, { useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
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
    <div className="relative flex w-full items-end gap-2 rounded-xl border border-border bg-background p-2 shadow-sm transition-colors focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50">
      <label htmlFor="chat-input" className="sr-only">
        Message input
      </label>
      <textarea
        id="chat-input"
        ref={textareaRef}
        className={cn(
          "min-h-[44px] max-h-36 flex-1 resize-none bg-transparent px-2 py-2.5 text-sm text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
        )}
        placeholder={placeholder || "Type a prompt… (Enter to send, Shift+Enter for newline)"}
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
          "inline-flex h-10 w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg bg-primary text-primary-foreground font-medium transition-all shadow-sm",
          "hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "disabled:pointer-events-none disabled:opacity-40"
        )}
      >
        <SendHorizontal size={18} />
      </button>
    </div>
  );
};

export default React.memo(ChatInput);