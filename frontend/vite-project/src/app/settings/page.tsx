'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Moon, Sun, Monitor, Server, Save, CheckCircle2, XCircle, Cpu, UserCheck, Trash2 } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { config } from '@/lib/config';
import { getOrCreateGuestId } from '@/lib/guestId';
import { useChatHistory } from '@/features/chat/hooks/useChatHistory';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { clearAllGuestConversations } = useChatHistory();
  const [isSaved, setIsSaved] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [apiHealth, setApiHealth] = useState<'checking' | 'healthy' | 'unreachable'>('checking');
  const guestId = getOrCreateGuestId();

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch(`${config.apiBaseUrl}/`);
        if (res.ok) {
          setApiHealth('healthy');
        } else {
          setApiHealth('unreachable');
        }
      } catch {
        setApiHealth('unreachable');
      }
    }
    checkHealth();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="h-full w-full overflow-y-auto p-4 sm:p-8 bg-background text-foreground">
      <div className="max-w-3xl w-full mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/20 shrink-0">
            <Settings size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">Settings & Preferences</h1>
            <p className="text-xs text-muted-foreground">Manage workspace theme, system health, and AI engine status.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-5 pb-12">
          {/* Section 1: Appearance */}
          <div className="rounded-md border border-border bg-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
                <Sun size={15} className="text-primary" />
                <span>Appearance</span>
              </div>
              <span className="text-[11px] text-muted-foreground">Select workspace interface theme</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                  theme === 'light'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                }`}
              >
                <Sun size={15} />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                  theme === 'dark'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                }`}
              >
                <Moon size={15} />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-md border text-xs font-medium transition-colors cursor-pointer ${
                  theme === 'system'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                }`}
              >
                <Monitor size={15} />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* Section 2: Application */}
          <div className="rounded-md border border-border bg-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
                <Server size={15} className="text-primary" />
                <span>Application</span>
              </div>
              <span className="text-[11px] text-muted-foreground">Version & API status</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-md border border-border bg-muted/30">
                <span className="text-muted-foreground text-[11px]">SentinelForge Version</span>
                <span className="font-semibold text-foreground font-mono">v1.0.0</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-md border border-border bg-muted/30">
                <span className="text-muted-foreground text-[11px]">API Connection Status</span>
                <div className="flex items-center gap-1.5 font-medium">
                  {apiHealth === 'checking' ? (
                    <span className="text-muted-foreground">Checking...</span>
                  ) : apiHealth === 'healthy' ? (
                    <>
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      <span className="text-emerald-500">Connected</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={13} className="text-red-500" />
                      <span className="text-red-500">Unreachable</span>
                    </>
                  )}
                </div>
              </div>
              <div className="sm:col-span-2 flex items-center justify-between p-2.5 rounded-md border border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <UserCheck size={14} className="text-primary shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground text-[11px]">Guest Session</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{guestId}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowClearModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20 text-[11px] font-medium transition-colors cursor-pointer shrink-0"
                >
                  <Trash2 size={13} />
                  <span>Clear History</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: AI Engine */}
          <div className="rounded-md border border-border bg-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
                <Cpu size={15} className="text-primary" />
                <span>AI Engine</span>
              </div>
              <span className="text-[11px] text-muted-foreground">Provider & active model</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-md border border-border bg-muted/30">
                <span className="text-muted-foreground text-[11px]">Active LLM Provider</span>
                <span className="font-semibold text-foreground">Groq Cloud AI</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-md border border-border bg-muted/30">
                <span className="text-muted-foreground text-[11px]">Model Architecture</span>
                <span className="font-semibold text-foreground font-mono">Llama-3.1-8B-Instant</span>
              </div>
              <div className="sm:col-span-2 flex items-center justify-between p-2.5 rounded-md border border-border bg-muted/30">
                <span className="text-muted-foreground text-[11px]">Context Pipeline</span>
                <span className="font-semibold text-foreground">SAST + RAG Knowledge Index</span>
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="flex items-center justify-end gap-3 pt-1">
            {isSaved && (
              <span className="text-xs font-medium text-emerald-500 animate-message-enter">
                Preferences saved successfully!
              </span>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            >
              <Save size={15} />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>

        {showClearModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-md border border-border bg-card p-5 shadow-2xl flex flex-col gap-4 text-left animate-message-enter">
              <h3 className="font-bold text-sm text-foreground">Clear Chat History</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Clear all chat history for this browser?
              </p>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowClearModal(false)}
                  className="px-3.5 py-1.5 rounded-md border border-border bg-muted/50 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await clearAllGuestConversations();
                    setShowClearModal(false);
                  }}
                  className="px-3.5 py-1.5 rounded-md bg-danger text-white text-xs font-semibold hover:bg-danger/90 transition-colors shadow-2xs cursor-pointer"
                >
                  Clear History
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}