import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/pages/LoginPage";
import LandingPage from "@/pages/Landing";
import DashboardPage from "@/pages/Dashboard";
import RolesPage from "@/pages/Modules";
import ApprovalsPage from "@/pages/Readiness";
import AssistantPage from "@/pages/AI";
import { useAuthStore } from "@/lib/store/auth";
import { canAccessPath, permissions, type Permission } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function RedirectWithPermission({
  path,
  element,
}: {
  path: string;
  element: ReactNode;
}) {
  const { user } = useAuthStore();
  const required = (path in routePermissions ? routePermissions[path] : undefined) as Permission | undefined;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (required && !canAccessPath(user.role, path)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{element}</>;
}

const routePermissions = {
  "/dashboard": permissions.dashboard,
  "/roles": permissions.rbacRead,
  "/approvals": permissions.approvals,
  "/audit": permissions.audit,
  "/assistant": permissions.assistant,
  "/data": permissions.data,
  "/reports": permissions.reports,
  "/workflows": permissions.workflows,
  "/integrations": permissions.integrations,
  "/settings": permissions.settings,
} as const;

function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="grid min-h-[55vh] place-items-center">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/80 p-10 shadow-[0_20px_80px_-40px_rgba(12,18,20,0.35)] backdrop-blur">
        <div className="mb-6 inline-flex rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
          RBAC workspace
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route
            path="/dashboard"
            element={<RedirectWithPermission path="/dashboard" element={<DashboardPage />} />}
          />
          <Route
            path="/roles"
            element={<RedirectWithPermission path="/roles" element={<RolesPage />} />}
          />
          <Route
            path="/approvals"
            element={<RedirectWithPermission path="/approvals" element={<ApprovalsPage />} />}
          />
          <Route
            path="/audit"
            element={
              <RedirectWithPermission
                path="/audit"
                element={
                  <PlaceholderPage
                    title="Audit Trail"
                    description="Who approved what, when they approved it, and which permissions were touched."
                  />
                }
              />
            }
          />
          <Route
            path="/assistant"
            element={<RedirectWithPermission path="/assistant" element={<AssistantPage />} />}
          />
          <Route
            path="/data"
            element={
              <RedirectWithPermission
                path="/data"
                element={
                  <PlaceholderPage
                    title="Data Access"
                    description="Record-level visibility, evidence links, and scope filters will live here."
                  />
                }
              />
            }
          />
          <Route
            path="/reports"
            element={
              <RedirectWithPermission
                path="/reports"
                element={
                  <PlaceholderPage
                    title="Reports"
                    description="Leadership packs, role-scoped exports, and audit summaries will land here."
                  />
                }
              />
            }
          />
          <Route
            path="/workflows"
            element={
              <RedirectWithPermission
                path="/workflows"
                element={
                  <PlaceholderPage
                    title="Workflow Rules"
                    description="Approval chains, escalation paths, and exception handling are managed here."
                  />
                }
              />
            }
          />
          <Route
            path="/integrations"
            element={
              <RedirectWithPermission
                path="/integrations"
                element={
                  <PlaceholderPage
                    title="Integrations"
                    description="Connect identity, ERP, messaging, and storage systems behind role controls."
                  />
                }
              />
            }
          />
          <Route
            path="/settings"
            element={
              <RedirectWithPermission
                path="/settings"
                element={
                  <PlaceholderPage
                    title="Settings"
                    description="Tenant configuration, policy defaults, and security posture settings live here."
                  />
                }
              />
            }
          />

          <Route path="/modules" element={<Navigate to="/roles" replace />} />
          <Route path="/readiness" element={<Navigate to="/approvals" replace />} />
          <Route path="/ai" element={<Navigate to="/assistant" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
