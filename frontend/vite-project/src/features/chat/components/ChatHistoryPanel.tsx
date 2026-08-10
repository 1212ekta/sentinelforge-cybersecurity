'use client';

import React, { useState, useMemo } from 'react';
import { Plus, Search, X, MessageSquareDashed } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { useChatHistory } from '../hooks/useChatHistory';
import { ChatHistoryItem } from './ChatHistoryItem';
import { cn } from '@/utils/cn';

interface ChatHistoryPanelProps {
  collapsed: boolean;
}

export function ChatHistoryPanel({ collapsed }: ChatHistoryPanelProps) {
  const {
    conversations,
    activeId,
    createConversation,
    selectConversation,
    deleteConversation,
    renameConversation,
    duplicateConversation,
    exportConversation,
    clearAllGuestConversations,
  } = useChatHistory();

  const [searchQuery, setSearchQuery] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);


  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  return (
    <div className="flex flex-col gap-2 py-2">
      <div className={cn('px-2', collapsed && 'flex justify-center')}>
        {collapsed ? (
          <IconButton
            aria-label="New chat"
            onClick={createConversation}
            className="h-9 w-9 bg-primary/10 text-primary hover:bg-primary/20"
          >
            <Plus size={18} />
          </IconButton>
        ) : (
          <button
            onClick={createConversation}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-md bg-primary/10 px-3 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <Plus size={16} />
            <span>New Chat</span>
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="px-2">
          <div className="relative flex items-center rounded-md border border-border bg-background px-2.5 py-1 text-xs focus-within:border-primary/50">
            <Search size={13} className="shrink-0 text-muted-foreground mr-1.5" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              aria-label="Search conversation titles"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>
      )}

      {!collapsed && (
        <div className="px-3 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Recent Chats
        </div>
      )}

      <div className="flex flex-col gap-0.5 overflow-y-auto px-2">
        {filteredConversations.length === 0 ? (
          !collapsed && (
            <div className="flex flex-col items-center justify-center py-6 px-2 text-center text-xs text-muted-foreground gap-1.5">
              <MessageSquareDashed size={20} className="text-muted-foreground/60" />
              <span>{searchQuery ? 'No matching chats found' : 'No recent chats'}</span>
            </div>
          )
        ) : (
          filteredConversations.map((conv) => (
            <ChatHistoryItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeId}
              collapsed={collapsed}
              onSelect={() => selectConversation(conv.id)}
              onDelete={() => deleteConversation(conv.id)}
              onRename={(newTitle) => renameConversation(conv.id, newTitle)}
              onDuplicate={() => duplicateConversation(conv.id)}
              onExport={() => exportConversation(conv.id)}
            />
          ))
        )}
      </div>

      {!collapsed && conversations.length > 0 && (
        <div className="px-2 pt-2 border-t border-border/60">
          <button
            onClick={() => setShowClearModal(true)}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 px-2 rounded-md text-[11px] font-medium text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
          >
            <span>Clear Chat History</span>
          </button>
        </div>
      )}

      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-xs rounded-xl border border-border bg-card p-5 shadow-2xl flex flex-col gap-4 text-left animate-message-enter">
            <h3 className="font-bold text-sm text-foreground">Clear Chat History</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Clear all chat history for this browser?
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-3 py-1.5 rounded-lg border border-border bg-muted/50 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await clearAllGuestConversations();
                  setShowClearModal(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-danger text-white text-xs font-semibold hover:bg-danger/90 transition-colors shadow-2xs cursor-pointer"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

