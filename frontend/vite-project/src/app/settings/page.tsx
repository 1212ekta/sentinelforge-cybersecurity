'use client';

import React, { useState } from 'react';
import { Settings, Moon, Sun, Monitor, Cpu, Server, Database, Save, RotateCcw } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [model, setModel] = useState('phi3:mini');
  const [backendUrl, setBackendUrl] = useState('http://localhost:8000');
  const [chunkSize, setChunkSize] = useState('512');
  const [embeddingModel, setEmbeddingModel] = useState('nomic-embed-text');
  const [isSaved, setIsSaved] = useState(false);

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
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Settings size={22} />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Settings & Preferences</h1>
            <p className="text-xs text-muted-foreground">Configure AI models, theme, backend endpoints, and RAG pipeline defaults.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-6 pb-12">
          {/* Appearance Section */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 font-medium text-sm text-foreground">
              <Sun size={18} className="text-primary" />
              <span>Appearance</span>
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

          {/* Model & AI Settings */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 font-medium text-sm text-foreground">
              <Cpu size={18} className="text-primary" />
              <span>Ollama AI Model Configuration</span>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="model-select" className="text-xs text-muted-foreground">
                Default LLM Model
              </label>
              <select
                id="model-select"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="phi3:mini">phi3:mini (3.8B - Fast CPU)</option>
                <option value="llama3:8b">llama3:8b (8B - Balanced)</option>
                <option value="mistral:7b">mistral:7b (7B - Reasoning)</option>
                <option value="deepseek-coder">deepseek-coder (6.7B - Security Code)</option>
              </select>
            </div>
          </div>

          {/* Backend Server Settings */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 font-medium text-sm text-foreground">
              <Server size={18} className="text-primary" />
              <span>Backend API Server</span>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="backend-url" className="text-xs text-muted-foreground">
                FastAPI Base URL
              </label>
              <div className="flex gap-2">
                <input
                  id="backend-url"
                  type="url"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="http://localhost:8000"
                />
                <button
                  type="button"
                  onClick={() => setBackendUrl('http://localhost:8000')}
                  className="px-3 py-2 rounded-lg border border-border bg-muted/50 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* RAG & Embedding Pipeline Defaults */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 font-medium text-sm text-foreground">
              <Database size={18} className="text-primary" />
              <span>RAG Vector DB Pipeline (Future Milestone)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="embedding-model" className="text-xs text-muted-foreground">
                  Embeddings Model
                </label>
                <input
                  id="embedding-model"
                  type="text"
                  value={embeddingModel}
                  onChange={(e) => setEmbeddingModel(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="chunk-size" className="text-xs text-muted-foreground">
                  Document Chunk Size (Tokens)
                </label>
                <input
                  id="chunk-size"
                  type="number"
                  value={chunkSize}
                  onChange={(e) => setChunkSize(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            {isSaved && (
              <span className="text-xs font-medium text-success animate-fade-in">
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