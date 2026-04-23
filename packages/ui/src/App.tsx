import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import Dashboard from "@/pages/Dashboard";
import Modules from "@/pages/Modules";
import AIAssistant from "@/pages/AI";
import LandingPage from "@/pages/Landing";
import Readiness from "@/pages/Readiness";

// Generic placeholder for routes not yet fully implemented
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center text-brand-green">
      <span className="text-2xl font-bold">E</span>
    </div>
    <h2 className="text-2xl font-bold text-brand-charcoal">{title}</h2>
    <p className="text-muted-foreground max-w-md">
      This module is being initialized for your enterprise. Please check back shortly as we sync your data frameworks.
    </p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Protected Routes Wrapper */}
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ai" element={<AIAssistant />} />
          <Route path="/modules" element={<Modules />} />
          <Route path="/templates" element={<PlaceholderPage title="Templates Library" />} />
          <Route path="/workflows" element={<PlaceholderPage title="Active Workflows" />} />
          <Route path="/review" element={<PlaceholderPage title="Review Queue" />} />
          <Route path="/data" element={<PlaceholderPage title="Data Records" />} />
          <Route path="/reports" element={<PlaceholderPage title="Filings & Reports" />} />
          <Route path="/channels" element={<PlaceholderPage title="Distribution Channels" />} />
          <Route path="/integrations" element={<PlaceholderPage title="Integrations Hub" />} />
          <Route path="/whatsapp-setup" element={<PlaceholderPage title="WhatsApp Business API" />} />
          <Route path="/email-templates" element={<PlaceholderPage title="Communication Templates" />} />
          <Route path="/settings" element={<PlaceholderPage title="User Settings" />} />
          <Route path="/platform" element={<PlaceholderPage title="Platform Console" />} />
          <Route path="/secrets" element={<PlaceholderPage title="Secrets Vault" />} />
          <Route path="/readiness" element={<Readiness />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
