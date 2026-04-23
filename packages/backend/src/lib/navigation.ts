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
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", permission: permissions.dashboard },
      { label: "Roles", href: "/roles", permission: permissions.rbacRead },
      { label: "Approvals", href: "/approvals", permission: permissions.approvals },
      { label: "Audit", href: "/audit", permission: permissions.audit },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Assistant", href: "/assistant", permission: permissions.assistant },
      { label: "Channels", href: "/channels", permission: permissions.channels },
      { label: "Data", href: "/data", permission: permissions.data },
      { label: "Reports", href: "/reports", permission: permissions.reports },
      { label: "Workflows", href: "/workflows", permission: permissions.workflows },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Integrations", href: "/integrations", permission: permissions.integrations },
      { label: "Settings", href: "/settings", permission: permissions.settings },
    ],
  },
];

export const headerShortcuts: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", permission: permissions.dashboard },
  { label: "Roles", href: "/roles", permission: permissions.rbacRead },
  { label: "Approvals", href: "/approvals", permission: permissions.approvals },
  { label: "Channels", href: "/channels", permission: permissions.channels },
];
