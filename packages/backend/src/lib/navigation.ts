import { permissions } from "./rbac.js";
import type { Permission } from "./rbac.js";

export interface NavItem {
  label: string;
  href: string;
  permission: Permission;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const sidebarSections: NavSection[] = [
  {
    label: "Main",
    items: [
      { label: "Home", href: "/dashboard", permission: permissions.dashboard },
      { label: "People & Access", href: "/roles", permission: permissions.rbacRead },
      { label: "Requests", href: "/approvals", permission: permissions.approvals },
      { label: "Activity History", href: "/audit", permission: permissions.audit },
    ],
  },
  {
    label: "Daily Work",
    items: [
      { label: "AI Chat", href: "/assistant", permission: permissions.assistant },
      { label: "Messages", href: "/channels", permission: permissions.channels },
      { label: "Records", href: "/data", permission: permissions.data },
      { label: "Reports", href: "/reports", permission: permissions.reports },
      { label: "Steps & Follow-ups", href: "/workflows", permission: permissions.workflows },
    ],
  },
  {
    label: "Setup",
    items: [
      { label: "Connected Apps", href: "/integrations", permission: permissions.integrations },
      { label: "Workspace Settings", href: "/settings", permission: permissions.settings },
    ],
  },
];

export const headerShortcuts: NavItem[] = [
  { label: "Home", href: "/dashboard", permission: permissions.dashboard },
  { label: "People & Access", href: "/roles", permission: permissions.rbacRead },
  { label: "Requests", href: "/approvals", permission: permissions.approvals },
  { label: "AI Chat", href: "/assistant", permission: permissions.assistant },
];
