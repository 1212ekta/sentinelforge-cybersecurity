import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Search, X, MessageSquareDashed, UserCheck, Trash2 } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/navigation';
import { SidebarNavItem } from './SidebarNavItem';
import { IconButton } from '@/components/ui/IconButton';
import { useChatHistory } from '@/features/chat/context/ChatHistoryContext';
import { ChatHistoryItem } from '@/features/chat/components/ChatHistoryItem';
import { getOrCreateGuestId } from '@/lib/guestId';
import { cn } from '@/utils/cn';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [pathname, setPathname] = useState(() => (typeof window !== 'undefined' ? window.location.pathname : '/chat'));
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);

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

  const guestId = useMemo(() => getOrCreateGuestId(), []);

  useEffect(() => {
    const handleNav = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handleNav);
    window.addEventListener('navigate' as any, handleNav);
    return () => {
      window.removeEventListener('popstate', handleNav);
      window.removeEventListener('navigate' as any, handleNav);
    };
  }, []);

  const handleBrandClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (window.location.pathname !== '/chat') {
      window.history.pushState({}, '', '/chat');
      window.dispatchEvent(new CustomEvent('navigate', { detail: '/chat' }));
    }
  };

  const handleNewChat = () => {
    if (window.location.pathname !== '/chat') {
      window.history.pushState({}, '', '/chat');
      window.dispatchEvent(new CustomEvent('navigate', { detail: '/chat' }));
    }
    createConversation();
  };

  const workspaceNavItems = useMemo(
    () => NAV_ITEMS.filter((item) => item.href !== '/settings'),
    []
  );

  const settingsNavItem = useMemo(
    () => NAV_ITEMS.find((item) => item.href === '/settings'),
    []
  );

  const filteredConversations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  return (
    <aside
      className={cn(
        'hidden shrink-0 flex-col border-r border-border bg-sidebar transition-all duration-200 md:flex',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* 1. Logo Header */}
      <div className={cn('flex h-14 items-center border-b border-border px-3', collapsed && 'justify-center')}>
        <a
          href="/chat"
          onClick={handleBrandClick}
          className="flex items-center gap-2.5 overflow-hidden hover:opacity-90 transition-opacity cursor-pointer focus:outline-none"
          title="SentinelForge - Home"
        >
          <img
            src="/sentinelforge-icon.png"
            alt="SentinelForge Shield Logo"
            className="h-8 w-8 object-contain shrink-0"
          />
          {!collapsed && (
            <span className="truncate font-extrabold text-foreground text-sm tracking-tight font-mono">
              SentinelForge
            </span>
          )}
        </a>
      </div>

      {/* 2. Main Scrollable Navigation Tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* + New Chat Button */}
        <div className={cn('px-1', collapsed && 'flex justify-center')}>
          {collapsed ? (
            <IconButton
              aria-label="New chat"
              onClick={handleNewChat}
              className="h-9 w-9 bg-primary/10 text-primary hover:bg-primary/20"
            >
              <Plus size={18} />
            </IconButton>
          ) : (
            <button
              onClick={handleNewChat}
              className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-primary/10 px-3 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 cursor-pointer"
            >
              <Plus size={16} />
              <span>New Chat</span>
            </button>
          )}
        </div>

        {/* WORKSPACE Navigation Section */}
        <div className="space-y-1">
          {!collapsed && (
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              Workspace
            </div>
          )}
          {workspaceNavItems.map((item) => (
            <SidebarNavItem key={item.href} item={item} collapsed={collapsed} />
          ))}
        </div>

        {/* Settings Navigation Item */}
        <div className="space-y-1">
          {settingsNavItem && (
            <SidebarNavItem item={settingsNavItem} collapsed={collapsed} />
          )}
        </div>

        {/* RECENT CHATS Section */}
        <div className="pt-2 border-t border-border/60 space-y-2">
          {!collapsed && (
            <div className="flex items-center justify-between px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              <span>Recent Chats</span>
              <span className="font-mono text-[9px] text-muted-foreground">{conversations.length}</span>
            </div>
          )}

          {!collapsed && (
            <div className="px-1">
              <div className="relative flex items-center rounded-lg border border-border bg-background px-2.5 py-1 text-xs focus-within:border-primary/50">
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
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-0.5 max-h-52 overflow-y-auto px-1">
            {filteredConversations.length === 0 ? (
              !collapsed && (
                <div className="flex flex-col items-center justify-center py-4 px-2 text-center text-xs text-muted-foreground gap-1">
                  <MessageSquareDashed size={18} className="text-muted-foreground/60" />
                  <span>{searchQuery ? 'No matching chats' : 'No recent chats'}</span>
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
      </div>

      {/* 3. Bottom-Anchored Session & Clear History Controls */}
      <div className="border-t border-border p-2 flex flex-col gap-1 shrink-0 bg-sidebar/50">
        {!collapsed ? (
          <div className="flex flex-col gap-1.5 p-2 rounded-lg border border-border/60 bg-background/50 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <UserCheck size={13} className="text-primary" />
                <span className="font-semibold text-foreground text-[11px]">Guest Session</span>
              </div>
              <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[80px]">
                {guestId.slice(0, 8)}
              </span>
            </div>
            <button
              onClick={() => setShowClearModal(true)}
              className="flex items-center justify-center gap-1.5 w-full py-1 px-2 rounded-md border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20 text-[11px] font-medium transition-colors cursor-pointer"
            >
              <Trash2 size={12} />
              <span>Clear History</span>
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <IconButton
              aria-label="Clear Chat History"
              onClick={() => setShowClearModal(true)}
              className="h-8 w-8 text-danger hover:bg-danger/10"
            >
              <Trash2 size={15} />
            </IconButton>
          </div>
        )}

        <IconButton
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={onToggle}
          className="w-full mt-1"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </IconButton>
      </div>

      {/* Clear Confirmation Modal */}
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
    </aside>
  );
}