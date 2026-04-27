import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import type { ReactNode } from "react";
import axios from "axios";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/pages/LoginPage";
import LandingPage from "@/pages/Landing";
import DashboardPage from "@/pages/Dashboard";
import RolesPage from "@/pages/Modules";
import ApprovalsPage from "@/pages/Readiness";
import AssistantPage from "@/pages/AI";
import { ActivityHistoryPage } from "@/pages/ActivityHistoryPage";
import { ChannelsConsolePage } from "@/pages/ChannelsConsolePage";
import { DataRecordsPage } from "@/pages/DataRecordsPage";
import { IntegrationsPage } from "@/pages/IntegrationsPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { WorkflowsPage } from "@/pages/WorkflowsPage";
import { useAuthStore } from "@/lib/store/auth";
import { canAccessPath } from "@/lib/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { refreshSession } from "@/lib/api/auth";

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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccessPath(user.role, path)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{element}</>;
}

function SessionRestoringScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,rgba(74,103,65,0.08),transparent_30%),linear-gradient(180deg,#fbfbf8_0%,#f3f5f1_100%)] p-4">
      <Card className="w-full max-w-xl border-white/60 bg-white/85 shadow-[0_20px_80px_-40px_rgba(12,18,20,0.35)] backdrop-blur">
        <CardHeader>
          <CardTitle className="text-3xl tracking-tight">Getting things ready</CardTitle>
          <CardDescription className="text-base leading-7">
            We are checking your saved sign-in and loading the right workspace for you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-2 overflow-hidden rounded-full bg-[#101513]/10">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#4A6741]" />
          </div>
          <p className="text-sm leading-7 text-muted-foreground">
            This helps us show the right pages and actions as soon as the app opens.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function AuthBootstrap() {
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const setSessionStatus = useAuthStore((state) => state.setSessionStatus);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    let active = true;

    if (!token) {
      setSessionStatus("ready");
      return () => {
        active = false;
      };
    }

    setSessionStatus("loading");

    void refreshSession()
      .then((session) => {
        if (!active) {
          return;
        }
        setAuth(session.user, session.tenant, session.token);
        setSessionStatus("ready");
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        if (axios.isAxiosError(error) && [401, 403].includes(error.response?.status ?? 0)) {
          clearAuth();
        }

        setSessionStatus("ready");
      });

    return () => {
      active = false;
    };
  }, [hasHydrated, token, setAuth, clearAuth, setSessionStatus]);

  return null;
}

export default function App() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const sessionStatus = useAuthStore((state) => state.sessionStatus);

  return (
    <BrowserRouter>
      <AuthBootstrap />
      {!hasHydrated || sessionStatus === "loading" ? (
        <SessionRestoringScreen />
      ) : (
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
            element={<RedirectWithPermission path="/audit" element={<ActivityHistoryPage />} />}
          />
          <Route
            path="/assistant"
            element={<RedirectWithPermission path="/assistant" element={<AssistantPage />} />}
          />
          <Route
            path="/chat"
            element={<RedirectWithPermission path="/assistant" element={<Navigate to="/assistant" replace />} />}
          />
          <Route
            path="/ai-chat"
            element={<RedirectWithPermission path="/assistant" element={<Navigate to="/assistant" replace />} />}
          />
          <Route
            path="/channels"
            element={<RedirectWithPermission path="/channels" element={<ChannelsConsolePage />} />}
          />
          <Route
            path="/data"
            element={<RedirectWithPermission path="/data" element={<DataRecordsPage />} />}
          />
          <Route
            path="/reports"
            element={<RedirectWithPermission path="/reports" element={<ReportsPage />} />}
          />
          <Route
            path="/workflows"
            element={<RedirectWithPermission path="/workflows" element={<WorkflowsPage />} />}
          />
          <Route
            path="/integrations"
            element={<RedirectWithPermission path="/integrations" element={<IntegrationsPage />} />}
          />
          <Route
            path="/settings"
            element={<RedirectWithPermission path="/settings" element={<SettingsPage />} />}
          />

          <Route path="/modules" element={<Navigate to="/roles" replace />} />
          <Route path="/readiness" element={<Navigate to="/approvals" replace />} />
          <Route path="/ai" element={<Navigate to="/assistant" replace />} />
          <Route path="/dashboard/channels" element={<Navigate to="/channels" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      )}
    </BrowserRouter>
  );
}
