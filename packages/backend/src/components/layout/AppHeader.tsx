import { Bell, Search, Shield, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getRoleLabel, hasPermission, permissions } from "@/lib/rbac";
import { useAuthStore } from "@/lib/store/auth";

const shortcuts = [
  { label: "Dashboard", href: "/dashboard", permission: permissions.dashboard },
  { label: "Roles", href: "/roles", permission: permissions.rbacRead },
  { label: "Approvals", href: "/approvals", permission: permissions.approvals },
  { label: "Audit", href: "/audit", permission: permissions.audit },
];

export function AppHeader() {
  const user = useAuthStore((state) => state.user);
  const roleLabel = getRoleLabel(user?.role);
  const canManage = hasPermission(user?.role, permissions.rbacManage);

  const visibleShortcuts = shortcuts.filter((item) => hasPermission(user?.role, item.permission));

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="flex items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {roleLabel} session
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto md:hidden">
            {visibleShortcuts.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition-colors",
                    isActive
                      ? "bg-foreground text-background"
                      : "bg-white/70 text-muted-foreground hover:text-foreground"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <div className="mt-2 hidden max-w-xl md:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users, roles, or policies"
                className="h-11 border-white/10 bg-white/70 pl-10 shadow-sm shadow-black/5 backdrop-blur"
              />
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {visibleShortcuts.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "rounded-full px-3 py-2 text-xs font-semibold transition-colors",
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/60 px-3 py-2 text-xs font-medium text-muted-foreground sm:flex">
            <Shield className="h-3.5 w-3.5 text-[#4A6741]" />
            {canManage ? "Privileged session" : "Restricted session"}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full border border-white/10 bg-white/60"
          >
            <Bell className="h-4 w-4" />
          </Button>
          <Button className="h-10 rounded-full bg-[#101513] px-4 text-sm font-medium text-white hover:bg-[#101513]/90">
            {canManage ? "Invite user" : "Request access"}
          </Button>
        </div>
      </div>
    </header>
  );
}
