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
  } = useChatHistory();

  const [searchQuery, setSearchQuery] = useState('');

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
    </div>
  );
}
