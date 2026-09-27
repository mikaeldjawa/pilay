import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  MessagesSquare,
  AlertTriangle,
  ListChecks,
  FileText,
  BarChart3,
  FolderOpen,
  FileStack,
  NotebookPen,
  CalendarRange,
  Settings,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Students", href: "/students", icon: Users },
  { title: "Counseling", href: "/counseling", icon: MessagesSquare },
  { title: "Incidents", href: "/incidents", icon: AlertTriangle },
  { title: "Follow-ups", href: "/follow-ups", icon: ListChecks },
  { title: "Reports", href: "/reports", icon: FileText },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Documents", href: "/documents", icon: FolderOpen },
  { title: "Templates", href: "/templates", icon: FileStack },
  { title: "Journal", href: "/journal", icon: NotebookPen },
  { title: "Teaching Plans", href: "/teaching-plans", icon: CalendarRange },
  { title: "Settings", href: "/settings", icon: Settings },
];
