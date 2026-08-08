import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/navigation';
import { IconButton } from '@/components/ui/IconButton';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onOpenMobileNav: () => void;
}

export function Header({ onOpenMobileNav }: HeaderProps) {
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

  const activeItem = NAV_ITEMS.find((item) =>
    item.href === '/chat'
      ? pathname === '/' || pathname === '/chat' || pathname?.startsWith('/chat')
      : pathname?.startsWith(item.href)
  );

  const title = activeItem?.label ?? 'SentinelForge';

  const handleBrandClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (window.location.pathname !== '/chat') {
      window.history.pushState({}, '', '/chat');
      window.dispatchEvent(new CustomEvent('navigate', { detail: '/chat' }));
    }
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <IconButton
          aria-label="Open menu"
          onClick={onOpenMobileNav}
          className="md:hidden"
        >
          <Menu size={20} />
        </IconButton>

        <a
          href="/chat"
          onClick={handleBrandClick}
          className="flex items-center gap-2 overflow-hidden hover:opacity-90 transition-opacity cursor-pointer focus:outline-none"
          title="SentinelForge - Home"
        >
          <img
            src="/logo.png"
            alt="SentinelForge Logo"
            className="h-7 w-7 object-contain rounded shrink-0"
          />
          <span className="font-semibold text-foreground text-sm sm:text-base truncate">
            {title}
          </span>
        </a>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <ThemeToggle />
      </div>
    </header>
  );
}