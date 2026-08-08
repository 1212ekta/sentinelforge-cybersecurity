import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/navigation';
import { SidebarNavItem } from './SidebarNavItem';
import { IconButton } from '@/components/ui/IconButton';
import { ChatHistoryPanel } from '@/features/chat/components/ChatHistoryPanel';
import { useMediaQuery } from '@/hooks/useMediaQuery';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const [pathname, setPathname] = useState(() => (typeof window !== 'undefined' ? window.location.pathname : '/chat'));
  const isDesktop = useMediaQuery('(min-width: 768px)');

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

  useEffect(() => {
    if (isDesktop && open) {
      onClose();
    }
  }, [isDesktop, open, onClose]);

  if (!open) return null;

  const handleBrandClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onClose();
    if (window.location.pathname !== '/chat') {
      window.history.pushState({}, '', '/chat');
      window.dispatchEvent(new CustomEvent('navigate', { detail: '/chat' }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col bg-sidebar shadow-2xl animate-slide-in-left motion-reduce:animate-none">
        <div className="flex h-14 items-center justify-between border-b border-border px-3 shrink-0">
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
            <span className="font-semibold text-sidebar-foreground truncate">
              SentinelForge
            </span>
          </a>
          <IconButton aria-label="Close menu" onClick={onClose} className="h-10 w-10">
            <X size={20} />
          </IconButton>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <SidebarNavItem
                key={item.href}
                item={item}
                collapsed={false}
                onNavigate={onClose}
              />
            ))}
          </div>

          {isChatRoute && (
            <div className="mt-4 border-t border-border pt-2" onClick={onClose}>
              <ChatHistoryPanel collapsed={false} />
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}