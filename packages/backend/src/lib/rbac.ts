import type { User } from "../types/index.js";

export type Role = User["role"];

export type Permission =
  | "dashboard:read"
  | "rbac:read"
  | "rbac:manage"
  | "approvals:review"
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
    summary: "Full platform control, including tenant provisioning and security policy.",
    scope: "All areas",
    color: "from-slate-900 to-slate-600",
  },
  {
    role: "owner",
    label: "Owner",
    summary: "Executive control over access, approvals, and configuration.",
    scope: "All areas",
    color: "from-emerald-900 to-emerald-600",
  },
  {
    role: "admin",
    label: "Admin",
    summary: "Operational administration for users, policies, and integrations.",
    scope: "Configuration",
    color: "from-teal-900 to-teal-600",
  },
  {
    role: "manager",
    label: "Manager",
    summary: "Approves changes, reviews risk, and supervises day-to-day access.",
    scope: "Approvals + oversight",
    color: "from-lime-900 to-lime-600",
  },
  {
    role: "member",
    label: "Member",
    summary: "Contributes data, submits requests, and views their assigned scope.",
    scope: "Operational work",
    color: "from-stone-900 to-stone-600",
  },
  {
    role: "viewer",
    label: "Viewer",
    summary: "Read-only access for audit, leadership, and review stakeholders.",
    scope: "Read only",
    color: "from-neutral-900 to-neutral-600",
  },
  {
    role: "ceo",
    label: "CEO",
    summary: "Executive visibility into risk posture, approvals, and reporting.",
    scope: "Leadership view",
    color: "from-emerald-950 to-emerald-700",
  },
  {
    role: "c_env_officer",
    label: "C. Env. Officer",
    summary: "Environmental owner responsible for policy checks and evidence quality.",
    scope: "Policy review",
    color: "from-amber-950 to-amber-700",
  },
  {
    role: "project_ops",
    label: "Project Ops",
    summary: "Coordinates project-level submissions, data collection, and follow-ups.",
    scope: "Project execution",
    color: "from-sky-950 to-sky-700",
  },
  {
    role: "hr",
    label: "HR",
    summary: "Handles people data and workforce-related review flows.",
    scope: "People data",
    color: "from-fuchsia-950 to-fuchsia-700",
  },
  {
    role: "finance",
    label: "Finance",
    summary: "Owns financial reporting inputs, controls, and audit evidence.",
    scope: "Finance controls",
    color: "from-cyan-950 to-cyan-700",
  },
  {
    role: "accounts_exec",
    label: "Accounts Exec",
    summary: "Prepares reconciliations and supporting records for reporting.",
    scope: "Ledger support",
    color: "from-indigo-950 to-indigo-700",
  },
];

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
