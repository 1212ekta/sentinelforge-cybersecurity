'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { generateId } from '@/utils/generateId';
import { config } from '@/lib/config';
import type { ChatMessage, Conversation } from '../types/chat.types';

const CONVERSATIONS_KEY = 'sf-chat-conversations';
const ACTIVE_ID_KEY = 'sf-active-chat-id';
const API_BASE = config.apiBaseUrl;

function deriveTitle(messages: ChatMessage[]): string {
  const firstUser = messages.find(
    (m) => m.role === 'user' && m.content.trim().length > 0
  );
  if (!firstUser) return 'New Chat';
  const trimmed = firstUser.content.trim().replace(/\s+/g, ' ');
  return trimmed.length > 28 ? `${trimmed.slice(0, 28)}...` : trimmed;
}

export function useChatHistory() {
  const [conversations, setConversations] = useLocalStorage<Conversation[]>(
    CONVERSATIONS_KEY,
    []
  );
  const [activeId, setActiveId] = useLocalStorage<string | null>(
    ACTIVE_ID_KEY,
    null
  );

  const createNewConversation = useCallback((): Conversation => {
    const nowISO = new Date().toISOString();
    return {
      id: generateId(),
      title: 'New Chat',
      createdAt: nowISO,
      updatedAt: nowISO,
      messages: [],
    };
  }, []);

  // Sync conversations from backend database on mount
  useEffect(() => {
    async function syncBackendConversations() {
      try {
        const res = await fetch(`${API_BASE}/conversations`);
        if (!res.ok) return;
        const data: Array<{ id: string; title: string; created_at: string; updated_at: string }> = await res.json();
        if (data.length > 0) {
          setConversations((prev) => {
            const mapped: Conversation[] = data.map((item) => {
              const existing = prev.find((c) => c.id === item.id);
              return {
                id: item.id,
                title: item.title,
                createdAt: item.created_at,
                updatedAt: item.updated_at,
                messages: existing ? existing.messages : [],
              };
            });
            return mapped;
          });
        }
      } catch {
        // Fallback silently to localStorage
      }
    }
    syncBackendConversations();
  }, [setConversations]);

  useEffect(() => {
    if (conversations.length === 0) {
      const initial = createNewConversation();
      setConversations([initial]);
      setActiveId(initial.id);
      return;
    }

    if (!activeId || !conversations.some((c) => c.id === activeId)) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId, createNewConversation, setConversations, setActiveId]);

  const sortedConversations = useMemo(() => {
    return [...conversations].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [conversations]);

  const activeConversation = conversations.find((c) => c.id === activeId) || sortedConversations[0];

  const createConversation = useCallback(() => {
    const newConv = createNewConversation();
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);

    fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Chat' }),
    }).catch(() => {});

    return newConv.id;
  }, [createNewConversation, setConversations, setActiveId]);

  const selectConversation = useCallback(
    async (id: string) => {
      if (conversations.some((c) => c.id === id)) {
        setActiveId(id);
        // Load messages from backend for selected conversation
        try {
          const res = await fetch(`${API_BASE}/conversations/${id}/messages`);
          if (!res.ok) return;
          const msgs: Array<{ id: string; role: 'user' | 'assistant' | 'system'; content: string; created_at: string }> = await res.json();
          const chatMsgs: ChatMessage[] = msgs.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            createdAt: new Date(m.created_at).getTime(),
            status: 'complete',
          }));
          setConversations((prev) =>
            prev.map((c) => (c.id === id ? { ...c, messages: chatMsgs } : c))
          );
        } catch {
          // Ignore
        }
      }
    },
    [conversations, setActiveId, setConversations]
  );

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== id);
        if (filtered.length === 0) {
          const fresh = createNewConversation();
          setActiveId(fresh.id);
          return [fresh];
        }
        if (activeId === id) {
          setActiveId(filtered[0].id);
        }
        return filtered;
      });

      fetch(`${API_BASE}/conversations/${id}`, { method: 'DELETE' }).catch(() => {});
    },
    [activeId, createNewConversation, setConversations, setActiveId]
  );

  const renameConversation = useCallback(
    (id: string, newTitle: string) => {
      const trimmed = newTitle.trim();
      if (!trimmed) return;
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: trimmed, updatedAt: new Date().toISOString() } : c))
      );

      fetch(`${API_BASE}/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed }),
      }).catch(() => {});
    },
    [setConversations]
  );

  const duplicateConversation = useCallback(
    (id: string) => {
      const target = conversations.find((c) => c.id === id);
      if (!target) return;
      const nowISO = new Date().toISOString();
      const duplicate: Conversation = {
        id: generateId(),
        title: `Copy of ${target.title}`,
        createdAt: nowISO,
        updatedAt: nowISO,
        messages: JSON.parse(JSON.stringify(target.messages)),
      };
      setConversations((prev) => [duplicate, ...prev]);
      setActiveId(duplicate.id);
    },
    [conversations, setConversations, setActiveId]
  );

  const exportConversation = useCallback(
    (id: string) => {
      const target = conversations.find((c) => c.id === id);
      if (!target) return;
      const markdown = `# ${target.title}\n*Exported: ${new Date().toLocaleString()}*\n\n` +
        target.messages.map((m) => `### ${m.role === 'user' ? 'User' : 'Sentinel AI'}\n${m.content}\n`).join('\n');
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${target.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.md`;
      link.click();
      URL.revokeObjectURL(url);
    },
    [conversations]
  );

  const updateActiveMessages = useCallback(
    (messages: ChatMessage[]) => {
      if (!activeId) return;
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== activeId) return c;
          const newTitle = deriveTitle(messages);
          return {
            ...c,
            title: newTitle,
            updatedAt: new Date().toISOString(),
            messages,
          };
        })
      );
    },
    [activeId, setConversations]
  );

  return {
    conversations: sortedConversations,
    activeId,
    activeConversation,
    createConversation,
    selectConversation,
    deleteConversation,
    renameConversation,
    duplicateConversation,
    exportConversation,
    updateActiveMessages,
  };
}
