'use client';

import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { IconButton } from '@/components/ui/IconButton';
import { ThemeToggle } from './ThemeToggle';
import { NAV_ITEMS } from '@/lib/navigation';

interface HeaderProps {
  onOpenMobileNav: () => void;
}

export function Header({ onOpenMobileNav }: HeaderProps) {
  const pathname = usePathname();
  const activeItem = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname?.startsWith(`${item.href}/`)
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