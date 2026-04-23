import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/pages/LoginPage";
import LandingPage from "@/pages/Landing";
import DashboardPage from "@/pages/Dashboard";
import ModulesPage from "@/pages/Modules";
import AIAssistant from "@/pages/AI";
import ReadinessPage from "@/pages/Readiness";

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
          Coming soon
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
          {description}
        </p>
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

        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/ai" element={<AIAssistant />} />
          <Route path="/modules" element={<ModulesPage />} />
          <Route path="/readiness" element={<ReadinessPage />} />
          <Route
            path="/templates"
            element={
              <PlaceholderPage
                title="Templates Library"
                description="Reusable disclosure templates, checklists, and narrative blocks will live here."
              />
            }
          />
          <Route
            path="/workflows"
            element={
              <PlaceholderPage
                title="Workflow Orchestration"
                description="Approvals, escalations, and review routing will be surfaced in this section."
              />
            }
          />
          <Route
            path="/review"
            element={
              <PlaceholderPage
                title="Review Queue"
                description="Exception handling and reviewer assignments will appear here."
              />
            }
          />
          <Route
            path="/data"
            element={
              <PlaceholderPage
                title="Data Records"
                description="Evidence records, source links, and ingestion history will be tracked here."
              />
            }
          />
          <Route
            path="/reports"
            element={
              <PlaceholderPage
                title="Reports"
                description="BRSR outputs, audit packets, and filing exports will be organized here."
              />
            }
          />
          <Route
            path="/channels"
            element={
              <PlaceholderPage
                title="Channels"
                description="WhatsApp, email, and system channels can be configured from here."
              />
            }
          />
          <Route
            path="/integrations"
            element={
              <PlaceholderPage
                title="Integrations"
                description="ERP, messaging, and document integrations will plug into this control panel."
              />
            }
          />
          <Route
            path="/whatsapp-setup"
            element={
              <PlaceholderPage
                title="WhatsApp Setup"
                description="Channel onboarding and API configuration will be surfaced here."
              />
            }
          />
          <Route
            path="/email-templates"
            element={
              <PlaceholderPage
                title="Email Templates"
                description="Operational communication templates will be managed here."
              />
            }
          />
          <Route
            path="/settings"
            element={
              <PlaceholderPage
                title="Settings"
                description="Workspace, profile, and platform preferences will be managed here."
              />
            }
          />
          <Route
            path="/platform"
            element={
              <PlaceholderPage
                title="Platform Console"
                description="Administrative tooling and system health controls will live here."
              />
            }
          />
          <Route
            path="/secrets"
            element={
              <PlaceholderPage
                title="Secrets Vault"
                description="Sensitive environment and integration credentials will be secured here."
              />
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
