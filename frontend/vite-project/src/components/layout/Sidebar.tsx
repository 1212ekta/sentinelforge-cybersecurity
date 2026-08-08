import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/navigation';
import { SidebarNavItem } from './SidebarNavItem';
import { IconButton } from '@/components/ui/IconButton';
import { ChatHistoryPanel } from '@/features/chat/components/ChatHistoryPanel';
import { cn } from '@/utils/cn';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [pathname, setPathname] = useState(() => (typeof window !== 'undefined' ? window.location.pathname : '/chat'));

  useEffect(() => {
    const handleNav = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handleNav);
    window.addEventListener('navigate' as any, handleNav);
    return () => {
      window.removeEventListener('popstate', handleNav);
      window.removeEventListener('navigate' as any, handleNav);
    };
  }, []);

  const isChatRoute = pathname === '/' || pathname === '/chat' || pathname?.startsWith('/chat');

  const handleBrandClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (window.location.pathname !== '/chat') {
      window.history.pushState({}, '', '/chat');
      window.dispatchEvent(new CustomEvent('navigate', { detail: '/chat' }));
    }
  };

  return (
    <aside
      className={cn(
        'hidden shrink-0 flex-col border-r border-border bg-sidebar transition-all duration-200 md:flex',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-border px-3">
        <a
          href="/chat"
          onClick={handleBrandClick}
          className="flex items-center gap-2 overflow-hidden hover:opacity-90 transition-opacity cursor-pointer focus:outline-none"
          title="SentinelForge - Home"
        >
          <img
            src="/logo.png"
            alt="SentinelForge Logo"
            className="h-8 w-8 object-contain rounded-md shrink-0"
          />
          {!collapsed && (
            <span className="truncate font-semibold text-sidebar-foreground">
              SentinelForge
            </span>
          )}
        </a>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <SidebarNavItem key={item.href} item={item} collapsed={collapsed} />
          ))}
        </div>

        {isChatRoute && (
          <div className="mt-4 border-t border-border pt-2">
            <ChatHistoryPanel collapsed={collapsed} />
          </div>
        )}
      </nav>

      <div className="border-t border-border p-2">
        <IconButton
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={onToggle}
          className="w-full"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </IconButton>
      </div>
    </aside>
  );
}