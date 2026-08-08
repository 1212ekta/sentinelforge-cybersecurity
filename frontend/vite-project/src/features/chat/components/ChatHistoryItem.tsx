'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, MoreVertical, Pencil, Copy, Download, Trash2, Check, X } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { cn } from '@/utils/cn';
import type { Conversation } from '../types/chat.types';

interface ChatHistoryItemProps {
  conversation: Conversation;
  isActive: boolean;
  collapsed: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (newTitle: string) => void;
  onDuplicate: () => void;
  onExport: () => void;
}

export function ChatHistoryItem({
  conversation,
  isActive,
  collapsed,
  onSelect,
  onDelete,
  onRename,
  onDuplicate,
  onExport,
}: ChatHistoryItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(conversation.title);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setTitleInput(conversation.title);
  }, [conversation.title]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  const handleSaveRename = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (titleInput.trim()) {
      onRename(titleInput.trim());
    } else {
      setTitleInput(conversation.title);
    }
    setIsEditing(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(false);
    if (window.confirm(`Are you sure you want to delete "${conversation.title}"?`)) {
      onDelete();
    }
  };

  if (collapsed) {
    return (
      <button
        onClick={onSelect}
        title={conversation.title}
        aria-label={`Switch to chat: ${conversation.title}`}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-md text-sidebar-foreground/80 transition-colors hover:bg-muted hover:text-sidebar-foreground mx-auto',
          isActive && 'bg-primary/10 text-primary font-medium'
        )}
      >
        <MessageSquare size={18} />
      </button>
    );
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSaveRename} className="flex h-9 items-center gap-1 rounded-md px-2 bg-muted/60 border border-primary/40">
        <input
          ref={inputRef}
          type="text"
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Escape' && setIsEditing(false)}
          className="min-w-0 flex-1 bg-transparent text-xs text-foreground focus:outline-none"
        />
        <IconButton aria-label="Save title" type="submit" className="h-6 w-6 text-success hover:bg-success/10">
          <Check size={13} />
        </IconButton>
        <IconButton
          aria-label="Cancel rename"
          type="button"
          onClick={() => setIsEditing(false)}
          className="h-6 w-6 text-muted-foreground hover:bg-muted"
        >
          <X size={13} />
        </IconButton>
      </form>
    );
  }

  return (
    <div
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        'group relative flex h-9 items-center justify-between gap-2 rounded-md px-2.5 text-sm transition-colors cursor-pointer select-none',
        isActive
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-sidebar-foreground/80 hover:bg-muted hover:text-sidebar-foreground'
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <MessageSquare size={16} className="shrink-0 text-muted-foreground" />
        <span className="truncate">{conversation.title}</span>
      </div>

      <div ref={menuRef} className="relative" onClick={(e) => e.stopPropagation()}>
        <IconButton
          aria-label={`Options for ${conversation.title}`}
          onClick={() => setMenuOpen((prev) => !prev)}
          className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
        >
          <MoreVertical size={14} />
        </IconButton>

        {menuOpen && (
          <div className="absolute right-0 top-8 z-50 min-w-[130px] rounded-lg border border-border bg-card p-1 shadow-md text-xs">
            <button
              onClick={() => {
                setMenuOpen(false);
                setIsEditing(true);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-foreground hover:bg-muted transition-colors text-left"
            >
              <Pencil size={13} className="text-muted-foreground" />
              <span>Rename</span>
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                onDuplicate();
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-foreground hover:bg-muted transition-colors text-left"
            >
              <Copy size={13} className="text-muted-foreground" />
              <span>Duplicate</span>
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                onExport();
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-foreground hover:bg-muted transition-colors text-left"
            >
              <Download size={13} className="text-muted-foreground" />
              <span>Export</span>
            </button>
            <div className="my-1 border-t border-border" />
            <button
              onClick={handleDelete}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-danger hover:bg-danger/10 transition-colors text-left"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
