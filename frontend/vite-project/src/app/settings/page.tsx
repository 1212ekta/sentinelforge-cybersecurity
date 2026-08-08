'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Moon, Sun, Monitor, Server, Save, CheckCircle2, XCircle, Info, ShieldCheck } from 'lucide-react';
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Settings size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Settings & System Preferences</h1>
            <p className="text-xs text-muted-foreground">Configure interface appearance, verify backend status, and inspect system information.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6 pb-12">
          {/* Appearance Section */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 font-medium text-sm text-foreground">
              <Sun size={18} className="text-primary" />
              <span>Interface Appearance</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border text-xs font-medium transition-all ${
                  theme === 'light'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted'
                }`}
              >
                <Sun size={18} />
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border text-xs font-medium transition-all ${
                  theme === 'dark'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted'
                }`}
              >
                <Moon size={18} />
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border text-xs font-medium transition-all ${
                  theme === 'system'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border bg-muted/40 text-muted-foreground hover:bg-muted'
                }`}
              >
                <Monitor size={18} />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* Backend Connection Status */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 font-medium text-sm text-foreground">
              <Server size={18} className="text-primary" />
              <span>Backend API Server Status</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/40 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono text-muted-foreground">{config.apiBaseUrl}</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                {apiHealth === 'checking' ? (
                  <span className="text-muted-foreground">Checking...</span>
                ) : apiHealth === 'healthy' ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span className="text-emerald-500">Connected & Online</span>
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="text-red-500" />
                    <span className="text-red-500">Unreachable</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Application Info */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 font-medium text-sm text-foreground">
              <Info size={18} className="text-primary" />
              <span>Application System Information</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex flex-col gap-1 p-3 rounded-lg border border-border bg-muted/40">
                <span className="text-muted-foreground">Application Version</span>
                <span className="font-semibold text-foreground">SentinelForge v1.0.0</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-lg border border-border bg-muted/40">
                <span className="text-muted-foreground">Cloud LLM Engine</span>
                <span className="font-semibold text-foreground">Groq Llama-3.1-8B-Instant</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-lg border border-border bg-muted/40">
                <span className="text-muted-foreground">Database Persistence</span>
                <span className="font-semibold text-foreground">MongoDB Atlas (`sentinelforge`)</span>
              </div>
              <div className="flex flex-col gap-1 p-3 rounded-lg border border-border bg-muted/40">
                <span className="text-muted-foreground">Security Engine</span>
                <span className="font-semibold text-foreground">SAST + RAG Audit Pipeline</span>
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {isSaved && (
              <span className="text-xs font-medium text-success">
                Preferences saved successfully!
              </span>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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