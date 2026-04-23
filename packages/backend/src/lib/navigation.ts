import {
  BarChart3,
  Clock3,
  Database,
  FileLock2,
  KeyRound,
  LayoutDashboard,
  MessagesSquare,
  MonitorCog,
  Terminal,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { permissions } from "./rbac.js";
import type { Permission } from "./rbac.js";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const sidebarSections: NavSection[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: permissions.dashboard },
      { label: "Roles", href: "/roles", icon: Users, permission: permissions.rbacRead },
      { label: "Approvals", href: "/approvals", icon: Clock3, permission: permissions.approvals },
      { label: "Audit", href: "/audit", icon: FileLock2, permission: permissions.audit },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Assistant", href: "/assistant", icon: MessagesSquare, permission: permissions.assistant },
      { label: "Channels", href: "/channels", icon: Terminal, permission: permissions.channels },
      { label: "Data", href: "/data", icon: Database, permission: permissions.data },
      { label: "Reports", href: "/reports", icon: BarChart3, permission: permissions.reports },
      { label: "Workflows", href: "/workflows", icon: Workflow, permission: permissions.workflows },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Integrations", href: "/integrations", icon: MonitorCog, permission: permissions.integrations },
      { label: "Settings", href: "/settings", icon: KeyRound, permission: permissions.settings },
    ],
  },
];

export const headerShortcuts: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: permissions.dashboard },
  { label: "Roles", href: "/roles", icon: Users, permission: permissions.rbacRead },
  { label: "Approvals", href: "/approvals", icon: Clock3, permission: permissions.approvals },
  { label: "Channels", href: "/channels", icon: Terminal, permission: permissions.channels },
];
