import { useMemo, useState } from "react";
import { Search, Shield, Users, UserCheck, KeyRound, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getRolePermissions, hasPermission, permissions, roleCatalog } from "@/lib/rbac";
import { useAuthStore } from "@/lib/store/auth";

const iconByRole = {
  super_admin: Crown,
  owner: Shield,
  admin: KeyRound,
  manager: Users,
  member: UserCheck,
  viewer: Shield,
  ceo: Crown,
  c_env_officer: Shield,
  project_ops: Users,
  hr: Users,
  finance: KeyRound,
  accounts_exec: KeyRound,
} as const;

export default function RolesPage() {
  const [query, setQuery] = useState("");
  const user = useAuthStore((state) => state.user);
  const canEdit = hasPermission(user?.role, permissions.rbacManage);

  const visibleRoles = useMemo(
    () =>
      roleCatalog.filter((role) =>
        `${role.label} ${role.summary} ${role.scope}`.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            Access control
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Roles and permission scopes
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
            Review the built-in role ladder, the default scope for each role, and how much of the
            workspace each role can reach.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter roles..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 border-white/10 bg-white/70 pl-10 shadow-sm"
            />
          </div>
          <Button className="h-11 rounded-full bg-[#101513] px-5 text-white hover:bg-[#101513]/90" disabled={!canEdit}>
            Create role
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleRoles.map((role) => {
          const Icon = iconByRole[role.role];
          const permissionsForRole = getRolePermissions(role.role);
          const isPrivileged = permissionsForRole.includes(permissions.rbacManage);

          return (
            <Card key={role.role} className="border-white/60 bg-white/80 shadow-sm">
              <CardHeader className="border-b border-border/60">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm",
                        role.role === "super_admin" || role.role === "owner"
                          ? "bg-[#101513]"
                          : role.role === "admin"
                            ? "bg-emerald-700"
                            : role.role === "manager"
                              ? "bg-lime-700"
                              : "bg-stone-700"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg tracking-tight">{role.label}</CardTitle>
                      <CardDescription className="mt-1 text-sm leading-6">
                        {role.summary}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full text-[10px] uppercase tracking-[0.2em]",
                      isPrivileged
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-border/60 bg-muted/50 text-muted-foreground"
                    )}
                  >
                    {role.scope}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap gap-2">
                  {permissionsForRole.map((permission) => (
                    <Badge
                      key={permission}
                      className="rounded-full border border-primary/15 bg-primary/5 text-[10px] uppercase tracking-[0.2em] text-primary hover:bg-primary/5"
                    >
                      {permission}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Role tier: {isPrivileged ? "Privileged" : "Standard"}
                  </span>
                  <Button variant="ghost" size="sm" className="rounded-full px-3 text-primary" disabled={!canEdit}>
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
