import type { User } from "../types/index.js";

export type Role = User["role"];

export type Permission =
  | "dashboard:read"
  | "rbac:read"
  | "rbac:manage"
  | "approvals:review"
  | "filings:approve"
  | "audit:read"
  | "assistant:use"
  | "channels:manage"
  | "data:read"
  | "reports:read"
  | "workflows:read"
  | "integrations:manage"
  | "settings:manage";

export const permissions = {
  dashboard: "dashboard:read",
  rbacRead: "rbac:read",
  rbacManage: "rbac:manage",
  approvals: "approvals:review",
  filingsApprove: "filings:approve",
  audit: "audit:read",
  assistant: "assistant:use",
  channels: "channels:manage",
  data: "data:read",
  reports: "reports:read",
  workflows: "workflows:read",
  integrations: "integrations:manage",
  settings: "settings:manage",
} as const;

const ALL_PERMISSIONS: Permission[] = Object.values(permissions);

const rolePermissionMap: Record<Role, Permission[]> = {
  super_admin: ALL_PERMISSIONS,
  owner: ALL_PERMISSIONS,
  admin: ALL_PERMISSIONS,
  cso: ALL_PERMISSIONS,
  senior_manager: [
    permissions.dashboard,
    permissions.rbacRead,
    permissions.approvals,
    permissions.audit,
    permissions.assistant,
    permissions.data,
    permissions.reports,
    permissions.workflows,
    permissions.filingsApprove,
  ],
  manager: [
    permissions.dashboard,
    permissions.rbacRead,
    permissions.approvals,
    permissions.audit,
    permissions.assistant,
    permissions.data,
    permissions.reports,
    permissions.workflows,
  ],
  member: [
    permissions.dashboard,
    permissions.rbacRead,
    permissions.audit,
    permissions.assistant,
    permissions.data,
    permissions.reports,
    permissions.workflows,
  ],
  viewer: [
    permissions.dashboard,
    permissions.rbacRead,
    permissions.audit,
    permissions.data,
    permissions.reports,
  ],
  ceo: [
    permissions.dashboard,
    permissions.rbacRead,
    permissions.audit,
    permissions.assistant,
    permissions.data,
    permissions.reports,
  ],
  c_env_officer: [
    permissions.dashboard,
    permissions.rbacRead,
    permissions.approvals,
    permissions.audit,
    permissions.assistant,
    permissions.data,
    permissions.reports,
    permissions.workflows,
  ],
  project_ops: [
    permissions.dashboard,
    permissions.rbacRead,
    permissions.approvals,
    permissions.audit,
    permissions.assistant,
    permissions.data,
    permissions.workflows,
  ],
  hr: [
    permissions.dashboard,
    permissions.rbacRead,
    permissions.audit,
    permissions.assistant,
    permissions.data,
    permissions.reports,
  ],
  finance: [
    permissions.dashboard,
    permissions.rbacRead,
    permissions.audit,
    permissions.assistant,
    permissions.data,
    permissions.reports,
  ],
  accounts_exec: [
    permissions.dashboard,
    permissions.rbacRead,
    permissions.audit,
    permissions.assistant,
    permissions.data,
    permissions.reports,
  ],
};

export const routePermissions: Record<string, Permission> = {
  "/dashboard": permissions.dashboard,
  "/roles": permissions.rbacRead,
  "/approvals": permissions.approvals,
  "/audit": permissions.audit,
  "/assistant": permissions.assistant,
  "/channels": permissions.channels,
  "/data": permissions.data,
  "/reports": permissions.reports,
  "/workflows": permissions.workflows,
  "/integrations": permissions.integrations,
  "/settings": permissions.settings,
};

export const roleCatalog: Array<{
  role: Role;
  label: string;
  summary: string;
  scope: string;
  color: string;
}> = [
  {
    role: "super_admin",
    label: "Super admin",
    summary: "Can open and change everything across the workspace.",
    scope: "Everything",
    color: "from-slate-900 to-slate-600",
  },
  {
    role: "owner",
    label: "Owner",
    summary: "Leads access decisions, approvals, and important workspace changes.",
    scope: "Everything",
    color: "from-emerald-900 to-emerald-600",
  },
  {
    role: "cso",
    label: "Chief Sustainability Officer",
    summary: "Full access to all BRSR modules, can review, approve, and assign ESG tasks.",
    scope: "ESG leadership",
    color: "from-green-900 to-green-600",
  },
  {
    role: "senior_manager",
    label: "Senior Manager",
    summary: "Full access to all BRSR modules, can review and assign, but cannot approve final filings.",
    scope: "ESG operations",
    color: "from-blue-900 to-blue-600",
  },
  {
    role: "admin",
    label: "Admin",
    summary: "Helps manage people, rules, and connected apps.",
    scope: "Setup and changes",
    color: "from-teal-900 to-teal-600",
  },
  {
    role: "manager",
    label: "Manager",
    summary: "Reviews requests and keeps day-to-day access on track.",
    scope: "Requests and oversight",
    color: "from-lime-900 to-lime-600",
  },
  {
    role: "member",
    label: "Member",
    summary: "Adds records, sends requests, and works in the areas assigned to them.",
    scope: "Assigned work",
    color: "from-stone-900 to-stone-600",
  },
  {
    role: "viewer",
    label: "Viewer",
    summary: "Can look around but cannot make changes.",
    scope: "View only",
    color: "from-neutral-900 to-neutral-600",
  },
  {
    role: "ceo",
    label: "CEO",
    summary: "Gets a high-level view of progress, requests, and reports.",
    scope: "Leadership view",
    color: "from-emerald-950 to-emerald-700",
  },
  {
    role: "c_env_officer",
    label: "C. Env. Officer",
    summary: "Checks that supporting details are complete and ready for review.",
    scope: "Quality review",
    color: "from-amber-950 to-amber-700",
  },
  {
    role: "project_ops",
    label: "Project Ops",
    summary: "Keeps project updates, records, and follow-ups moving.",
    scope: "Project work",
    color: "from-sky-950 to-sky-700",
  },
  {
    role: "hr",
    label: "HR",
    summary: "Handles people-related records and reviews.",
    scope: "People information",
    color: "from-fuchsia-950 to-fuchsia-700",
  },
  {
    role: "finance",
    label: "Finance",
    summary: "Looks after finance-related records, checks, and reports.",
    scope: "Finance work",
    color: "from-cyan-950 to-cyan-700",
  },
  {
    role: "accounts_exec",
    label: "Accounts Exec",
    summary: "Prepares supporting records and keeps account details up to date.",
    scope: "Account support",
    color: "from-indigo-950 to-indigo-700",
  },
];

export const permissionLabels: Record<Permission, string> = {
  "dashboard:read": "Home",
  "rbac:read": "People & access",
  "rbac:manage": "Change access",
  "approvals:review": "Review requests",
  "filings:approve": "Approve filings",
  "audit:read": "Activity history",
  "assistant:use": "AI Chat",
  "channels:manage": "Messages",
  "data:read": "Records",
  "reports:read": "Reports",
  "workflows:read": "Steps & follow-ups",
  "integrations:manage": "Connected apps",
  "settings:manage": "Workspace settings",
};

export function hasPermission(role: Role | null | undefined, permission: Permission): boolean {
  if (!role) {
    return false;
  }

  return rolePermissionMap[role].includes(permission);
}

export function canAccessPath(role: Role | null | undefined, path: string): boolean {
  const required = routePermissions[path];
  if (!required) {
    return true;
  }

  return hasPermission(role, required);
}

export function getRoleLabel(role: Role | null | undefined): string {
  return roleCatalog.find((entry) => entry.role === role)?.label ?? "Guest";
}

export function getRoleSummary(role: Role | null | undefined): string {
  return roleCatalog.find((entry) => entry.role === role)?.summary ?? "No role assigned.";
}

export function getRolePermissions(role: Role | null | undefined): Permission[] {
  if (!role) {
    return [];
  }

  return rolePermissionMap[role];
}
