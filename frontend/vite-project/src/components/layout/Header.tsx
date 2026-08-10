import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/navigation';
import { IconButton } from '@/components/ui/IconButton';
import { ThemeToggle } from './ThemeToggle';
import { config } from '@/lib/config';

interface HeaderProps {
  onOpenMobileNav: () => void;
}

const ROUTE_DESCRIPTIONS: Record<string, string> = {
  '/chat': 'AI security assistant for vulnerability guidance and code auditing',
  '/file-analysis': 'Automated SAST code audit and security findings',
  '/vulnerability-scanner': 'Source code vulnerability scanner and CVE detection',
  '/log-analysis': 'Security log stream inspection and brute-force detection',
  '/reports': 'Executive security assessment reports and downloads',
  '/settings': 'System preferences, interface theme, and API status',
};

export function Header({ onOpenMobileNav }: HeaderProps) {
  const [pathname, setPathname] = useState(() => (typeof window !== 'undefined' ? window.location.pathname : '/chat'));
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    const handleNav = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handleNav);
    window.addEventListener('navigate' as any, handleNav);
    return () => {
      window.removeEventListener('popstate', handleNav);
      window.removeEventListener('navigate' as any, handleNav);
    };
  }, []);

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch(`${config.apiBaseUrl}/`, { method: 'GET' });
        setIsOnline(res.ok);
      } catch {
        setIsOnline(false);
      }
    }
    checkHealth();
  }, []);

  const activeItem = NAV_ITEMS.find((item) =>
    item.href === '/chat'
      ? pathname === '/' || pathname === '/chat' || pathname?.startsWith('/chat')
      : pathname?.startsWith(item.href)
  );

  const matchedRoute = activeItem?.href ?? '/chat';
  const title = matchedRoute === '/chat' ? 'AI Security Analyst' : (activeItem?.label ?? 'SentinelForge');
  const description = ROUTE_DESCRIPTIONS[matchedRoute] ?? 'AI Cybersecurity Workspace';

  const handleBrandClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (window.location.pathname !== '/chat') {
      window.history.pushState({}, '', '/chat');
      window.dispatchEvent(new CustomEvent('navigate', { detail: '/chat' }));
    }
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background/95 backdrop-blur-xs px-4 shrink-0 gap-3">
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
          className="flex items-center gap-2.5 overflow-hidden hover:opacity-90 transition-opacity cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md p-1"
          title="SentinelForge - Home"
        >
          <img
            src="/sentinelforge-icon.png"
            alt="SentinelForge Shield Logo"
            className="h-6 w-6 sm:h-7 sm:w-7 object-contain rounded-md shrink-0 shadow-2xs"
          />

          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-foreground text-xs sm:text-sm truncate leading-tight">
              {title}
            </span>
            <span className="text-[11px] text-muted-foreground truncate hidden sm:inline-block">
              {description}
            </span>
          </div>
        </a>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-muted/40 text-[11px] font-medium text-muted-foreground">
          <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          <span>{isOnline ? 'API Connected' : 'API Offline'}</span>
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}