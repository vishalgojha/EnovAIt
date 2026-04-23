import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Clock3,
  Database,
  FileLock2,
  KeyRound,
  LayoutDashboard,
  MonitorCog,
  MessagesSquare,
  Shield,
  Users,
  Workflow,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { hasPermission, permissions, getRoleLabel, getRoleSummary } from "@/lib/rbac";
import { useAuthStore } from "@/lib/store/auth";

const sections = [
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

export function AppSidebar() {
  const user = useAuthStore((state) => state.user);
  const tenant = useAuthStore((state) => state.tenant);

  const visibleSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => hasPermission(user?.role, item.permission)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside className="hidden border-r border-white/10 bg-[#101513] text-white lg:flex lg:min-h-screen lg:flex-col">
      <div className="border-b border-white/10 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#4A6741] font-semibold text-white shadow-lg shadow-[#4A6741]/20">
            E
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">EnovAIt</p>
            <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">
              RBAC control plane
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-6">
          {visibleSections.map((section) => (
            <div key={section.label}>
              <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">
                {section.label}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.href}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors",
                        isActive
                          ? "bg-white/10 text-white shadow-inner"
                          : "text-white/55 hover:bg-white/5 hover:text-white"
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-[#4A6741] text-white">
                {(user?.name?.[0] ?? "U").toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user?.name ?? "Guest"}</p>
              <p className="truncate text-[11px] text-white/45">{user?.email ?? "Not signed in"}</p>
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Role</p>
            <p className="mt-1 text-sm font-medium text-white">{getRoleLabel(user?.role)}</p>
            <p className="mt-1 text-[11px] leading-5 text-white/55">{getRoleSummary(user?.role)}</p>
          </div>
          <p className="mt-3 text-[10px] uppercase tracking-[0.22em] text-white/35">
            {tenant?.name ?? "No tenant selected"}
          </p>
        </div>
      </div>
    </aside>
  );
}
