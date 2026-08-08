import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { ThemeToggle } from './ThemeToggle';
import { NAV_ITEMS } from '@/lib/navigation';

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

  const activeItem = NAV_ITEMS.find(
    (item) => pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}`))
  );

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-3">
        <IconButton
          aria-label="Open menu"
          onClick={onOpenMobileNav}
          className="md:hidden"
        >
          <Menu size={18} />
        </IconButton>
        <h1 className="text-sm font-medium text-foreground">
          {activeItem?.label ?? 'SentinelForge'}
        </h1>
      </div>
      <ThemeToggle />
    </header>
  );
}