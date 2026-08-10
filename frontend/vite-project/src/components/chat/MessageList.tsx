'use client';

import React from "react";
import type { ChatMessage } from "@/features/chat/types/chat.types";
import MessageBubble from "./MessageBubble";
import { ShieldCheck, SearchCode, Globe, Key } from "lucide-react";

type Props = {
  messages: ChatMessage[];
  onSelectPrompt?: (prompt: string) => void;
};

const SCROLL_THRESHOLD = 160;

const CYBERSECURITY_SUGGESTED_PROMPTS = [
  {
    icon: Globe,
    title: "Explain SQL injection prevention",
    description: "Understand SQLi risks, parameterized queries, and ORM defenses.",
    prompt: "Explain SQL injection prevention, parameterized queries, and how to protect database endpoints.",
  },
  {
    icon: ShieldCheck,
    title: "Analyze this security vulnerability",
    description: "Audit source code for insecure functions, CWE flaws, and remediation advice.",
    prompt: "Analyze this security vulnerability in my code snippet and suggest a secure refactored version.",
  },
  {
    icon: Key,
    title: "How should I secure a REST API?",
    description: "Authentication, CORS, rate limiting, and OWASP API Top 10 safeguards.",
    prompt: "How should I secure a REST API against OWASP API security risks, authentication flaws, and BOLA?",
  },
  {
    icon: SearchCode,
    title: "Explain CVE severity levels",
    description: "Common Vulnerabilities & Exposures scoring format and CVSS v3.1 metrics.",
    prompt: "Explain CVE severity levels, CVSS v3.1 scoring metrics, and how vulnerability severity is calculated.",
  },
];

const MessageList: React.FC<Props> = ({ messages, onSelectPrompt }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const atBottomRef = React.useRef(true);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      atBottomRef.current = distanceFromBottom < SCROLL_THRESHOLD;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (atBottomRef.current) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10 overflow-y-auto"
        role="status"
        aria-live="polite"
      >
        <div className="max-w-2xl w-full flex flex-col items-center text-center gap-6 my-auto py-8">
          {/* Centered Shield Icon with Subtle Floating Motion */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card border border-border shadow-xs animate-bubble-float">
              <img
                src="/sentinelforge-icon.png"
                alt="SentinelForge Icon"
                className="h-7 w-7 object-contain shrink-0"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              How can SentinelForge help?
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed font-normal">
              Ask about vulnerabilities, secure coding, threat analysis, or cybersecurity best practices.
            </p>
          </div>

          {/* 4 Compact Prompt Suggestions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left pt-3">
            {CYBERSECURITY_SUGGESTED_PROMPTS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectPrompt?.(item.prompt)}
                  className="flex flex-col gap-1.5 p-3.5 rounded-md border border-border bg-card hover:bg-card-surface hover:border-primary/40 hover:-translate-y-[1px] transition-all duration-normal text-left group cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-center gap-2 text-foreground font-semibold text-xs group-hover:text-primary transition-colors duration-normal">
                    <Icon size={15} className="text-primary shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 font-normal">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-1 flex-col overflow-y-auto px-2 sm:px-4 py-3 scroll-smooth space-y-4"
      ref={containerRef}
      role="log"
      aria-live="polite"
      aria-relevant="additions"
    >
      {messages.map((m, idx) => {
        let userPromptText = '';
        if (m.role === 'assistant') {
          for (let k = idx - 1; k >= 0; k--) {
            if (messages[k].role === 'user') {
              userPromptText = messages[k].content;
              break;
            }
          }
        }
        const isLatestAssistantMessage =
          m.role === 'assistant' &&
          m.status === 'complete' &&
          !messages.slice(idx + 1).some((msg) => msg.role === 'user' || msg.role === 'assistant');

        return (
          <MessageBubble
            key={m.id}
            message={m}
            userPromptText={userPromptText}
            onSelectPrompt={onSelectPrompt}
            isLatestAssistantMessage={isLatestAssistantMessage}
          />
        );
      })}
    </div>
  );
};

export default React.memo(MessageList);