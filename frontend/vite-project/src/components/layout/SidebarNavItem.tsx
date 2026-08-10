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
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive
          ? 'bg-primary/12 text-primary font-semibold border-r-2 border-primary'
          : 'text-sidebar-foreground/75 hover:bg-muted/70 hover:text-sidebar-foreground',
        collapsed && 'justify-center px-2 border-r-0'
      )}
      title={collapsed ? item.label : undefined}
    >
      <Icon size={18} className={cn('shrink-0 transition-transform duration-150 group-hover:scale-105', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-foreground')} />
      {!collapsed && (
        <span className="flex-1 truncate">{item.label}</span>
      )}
    </a>
  );
}