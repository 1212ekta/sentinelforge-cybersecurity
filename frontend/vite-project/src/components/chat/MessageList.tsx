'use client';

import React from "react";
import type { ChatMessage } from "@/features/chat/types/chat.types";
import MessageBubble from "./MessageBubble";
import { ShieldCheck, Code2, FileText, SearchCode, Globe, Key, Lock, Terminal, Cpu } from "lucide-react";

type Props = {
  messages: ChatMessage[];
  onSelectPrompt?: (prompt: string) => void;
};

const SCROLL_THRESHOLD = 160;

const CYBERSECURITY_SUGGESTED_PROMPTS = [
  {
    icon: Globe,
    title: "Explain SQL Injection",
    description: "Understand SQLi risks, parametrized queries, and ORM defenses.",
    prompt: "Explain how SQL Injection (SQLi) vulnerabilities occur in backend databases and how parameterized queries or ORMs mitigate them.",
  },
  {
    icon: Code2,
    title: "Review Code for Vulnerabilities",
    description: "Audit source code for insecure functions and OWASP flaws.",
    prompt: "Review the following code snippet for potential security vulnerabilities, buffer overflows, or injection risks, and provide a secure refactored version.",
  },
  {
    icon: Key,
    title: "Analyze Authentication",
    description: "Audit password hashing, session tokens, and MFA flow.",
    prompt: "Analyze this authentication implementation for common weaknesses such as weak password hashing, session fixations, or missing rate limiting.",
  },
  {
    icon: ShieldCheck,
    title: "Explain XSS & Prevention",
    description: "Reflected, Stored, & DOM XSS prevention techniques.",
    prompt: "Explain Cross-Site Scripting (XSS) including Reflected, Stored, and DOM-based variants, and how Content Security Policy (CSP) and context-aware encoding prevent them.",
  },
  {
    icon: FileText,
    title: "Analyze Security Log",
    description: "Audit auth.log, syslog, or web server access logs.",
    prompt: "How do I analyze a Linux /var/log/auth.log file to detect SSH brute-force attacks and privilege escalation attempts?",
  },
  {
    icon: SearchCode,
    title: "Explain a CVE",
    description: "Common Vulnerabilities & Exposures format and CVSS scoring.",
    prompt: "Explain the structure of a Common Vulnerabilities and Exposures (CVE) ID, CVSS v3.1 severity metrics, and how security advisories track RCE vulnerabilities.",
  },
  {
    icon: Lock,
    title: "Explain OWASP Top 10",
    description: "Key Web Application Security Risks and defenses.",
    prompt: "Provide an overview of the OWASP Top 10 Web Application Security Risks, highlighting key prevention techniques for Broken Access Control and Cryptographic Failures.",
  },
  {
    icon: Cpu,
    title: "Review API Security",
    description: "REST API security, CORS, Rate Limiting, & OWASP API Top 10.",
    prompt: "Review this REST API design for security issues according to the OWASP API Security Top 10, covering CORS, rate limiting, and broken object-level authorization (BOLA).",
  },
  {
    icon: Terminal,
    title: "Secure JWT Implementation",
    description: "JSON Web Tokens, signing algorithms, expiry, & revocation.",
    prompt: "Explain how to implement JSON Web Tokens (JWT) securely, including algorithm validation (preventing 'none' algorithm attacks), token expiry, and refresh token revocation.",
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
        className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto"
        role="status"
        aria-live="polite"
      >
        <div className="max-w-4xl w-full flex flex-col items-center text-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm border border-primary/20">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              SentinelForge
            </h1>
            <p className="text-sm font-semibold text-primary tracking-wide uppercase">
              AI-Powered Cybersecurity Assistant
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mt-1">
              Your specialized AI cybersecurity assistant for AppSec code reviews, vulnerability analysis, log auditing, and security engineering. Select a prompt to begin:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full text-left pt-2">
            {CYBERSECURITY_SUGGESTED_PROMPTS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectPrompt?.(item.prompt)}
                  className="flex flex-col gap-2 p-3.5 rounded-xl border border-border bg-card/70 hover:bg-muted hover:border-primary/40 transition-all text-left group cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-center gap-2 text-foreground font-semibold text-xs sm:text-sm group-hover:text-primary transition-colors">
                    <Icon size={17} className="text-primary shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
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
      className="flex flex-1 flex-col overflow-y-auto px-1 sm:px-2 scroll-smooth"
      ref={containerRef}
      role="log"
      aria-live="polite"
      aria-relevant="additions"
    >
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
    </div>
  );
};

export default React.memo(MessageList);