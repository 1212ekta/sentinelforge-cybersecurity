'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { X, ShieldHalf } from 'lucide-react';
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
  const pathname = usePathname();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isChatRoute = pathname === '/chat' || pathname?.startsWith('/chat');

  useEffect(() => {
    if (isDesktop && open) {
      onClose();
    }
  }, [isDesktop, open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden
      />
      <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col bg-sidebar shadow-2xl animate-slide-in-left motion-reduce:animate-none">
        <div className="flex h-14 items-center justify-between border-b border-border px-3 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldHalf size={22} className="text-primary shrink-0" />
            <span className="font-semibold text-sidebar-foreground truncate">
              SentinelForge
            </span>
          </div>
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