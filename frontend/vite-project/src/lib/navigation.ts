import {
  MessageSquare,
  FileSearch,
  ShieldAlert,
  ScrollText,
  FileBarChart,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'AI Chat', href: '/chat', icon: MessageSquare },
  { label: 'File Analysis', href: '/file-analysis', icon: FileSearch },
  { label: 'Vulnerability Scanner', href: '/vulnerability-scanner', icon: ShieldAlert },
  { label: 'Log Analysis', href: '/log-analysis', icon: ScrollText },
  { label: 'Reports', href: '/reports', icon: FileBarChart },
  { label: 'Settings', href: '/settings', icon: Settings },
];