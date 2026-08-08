import { cn } from '@/utils/cn';
import type { NavItem } from '@/lib/navigation';

interface SidebarNavItemProps {
  item: NavItem;
  collapsed: boolean;
  onNavigate?: () => void;
}

export function SidebarNavItem({ item, collapsed, onNavigate }: SidebarNavItemProps) {
  const currentPath = window.location.pathname;
  const isActive = currentPath === item.href || (item.href !== '/' && currentPath.startsWith(`${item.href}`));
  const Icon = item.icon;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.pushState({}, '', item.href);
    window.dispatchEvent(new CustomEvent('navigate', { detail: item.href }));
    if (onNavigate) onNavigate();
  };

  return (
    <a
      href={item.href}
      onClick={handleClick}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer',
        isActive
          ? 'bg-primary/10 text-primary font-semibold'
          : 'text-sidebar-foreground/80 hover:bg-muted hover:text-sidebar-foreground',
        collapsed && 'justify-center px-2'
      )}
      title={collapsed ? item.label : undefined}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && (
        <span className="flex-1 truncate">{item.label}</span>
      )}
      {!collapsed && item.comingSoon && (
        <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-normal">
          Soon
        </span>
      )}
    </a>
  );
}