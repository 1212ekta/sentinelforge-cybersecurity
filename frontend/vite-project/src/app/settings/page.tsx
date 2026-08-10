'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Moon, Sun, Monitor, Server, Save, CheckCircle2, XCircle, Info, Cpu, Sparkles } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { config } from '@/lib/config';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [isSaved, setIsSaved] = useState(false);
  const [apiHealth, setApiHealth] = useState<'checking' | 'healthy' | 'unreachable'>('checking');

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shrink-0">
            <Settings size={22} />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">Settings & Preferences</h1>
            <p className="text-xs text-muted-foreground">Manage appearance themes, view application status, and inspect AI model parameters.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6 pb-12">
          {/* Section 1: Appearance */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                <Sun size={16} className="text-primary" />
                <span>Appearance</span>
              </div>
              <span className="text-xs text-muted-foreground">Select workspace interface theme</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                }`}
              >
                <Sun size={18} />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                }`}
              >
                <Moon size={18} />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                }`}
              >
                <Monitor size={18} />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* Section 2: Application */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                <Server size={16} className="text-primary" />
                <span>Application</span>
              </div>
              <span className="text-xs text-muted-foreground">Version & environment status</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col gap-1 p-3 rounded-lg border border-border bg-muted/30">
                <span className="text-muted-foreground text-[11px]">SentinelForge Version</span>
                <span className="font-semibold text-foreground font-mono">v1.0.0</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-lg border border-border bg-muted/30">
                <span className="text-muted-foreground text-[11px]">Backend API Health</span>
                <div className="flex items-center gap-1.5 font-medium">
                  {apiHealth === 'checking' ? (
                    <span className="text-muted-foreground">Checking...</span>
                  ) : apiHealth === 'healthy' ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span className="text-emerald-500">Connected & Operational</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={14} className="text-red-500" />
                      <span className="text-red-500">Unreachable</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: AI Engine */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2 font-semibold text-sm text-foreground">
                <Cpu size={16} className="text-primary" />
                <span>AI Engine</span>
              </div>
              <span className="text-xs text-muted-foreground">Provider & active model</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col gap-1 p-3 rounded-lg border border-border bg-muted/30">
                <span className="text-muted-foreground text-[11px]">Active LLM Provider</span>
                <span className="font-semibold text-foreground">Groq Cloud AI</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-lg border border-border bg-muted/30">
                <span className="text-muted-foreground text-[11px]">Model Architecture</span>
                <span className="font-semibold text-foreground font-mono">Llama-3.1-8B-Instant</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-lg border border-border bg-muted/30">
                <span className="text-muted-foreground text-[11px]">Context Pipeline</span>
                <span className="font-semibold text-foreground">SAST + RAG Knowledge Index</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-lg border border-border bg-muted/30">
                <span className="text-muted-foreground text-[11px]">Security Assessment Mode</span>
                <span className="font-semibold text-emerald-500">Strict Threat Audit</span>
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {isSaved && (
              <span className="text-xs font-medium text-emerald-500 animate-fade-in">
                Preferences saved successfully!
              </span>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-xs hover:bg-primary/90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            >
              <Save size={16} />
              <span>Save Preferences</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}