'use client';

import React from "react";
import type { ChatMessage } from "@/features/chat/types/chat.types";

interface TypingIndicatorProps {
  message?: ChatMessage | null;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = () => {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full bg-muted/60 px-3 py-1.5 text-xs text-muted-foreground border border-border"
      role="status"
      aria-live="polite"
      aria-label="AI is typing"
    >
      <span className="font-medium text-foreground">Sentinel AI is thinking</span>
      <div className="flex items-center gap-1 ml-1">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-dot-pulse" style={{ animationDelay: '0ms' }} />
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-dot-pulse" style={{ animationDelay: '200ms' }} />
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-dot-pulse" style={{ animationDelay: '400ms' }} />
      </div>
    </div>
  );
};

export default TypingIndicator;