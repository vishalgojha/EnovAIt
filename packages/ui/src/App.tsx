import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { LandingPage } from '@/pages/LandingPage';
import { ModulesPage } from '@/pages/ModulesPage';
import { TemplatesPage } from '@/pages/TemplatesPage';
import { WorkflowRulesPage } from '@/pages/WorkflowRulesPage';
import { IntegrationsPage } from '@/pages/IntegrationsPage';
import { DataRecordsPage } from '@/pages/DataRecordsPage';
import { WorkflowsPage } from '@/pages/WorkflowsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { ChannelsConsolePage } from '@/pages/ChannelsConsolePage';
import { SettingsPage } from '@/pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  React.useEffect(() => {
    document.title = 'EnovAIt';
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="modules" element={<ModulesPage />} />
                <Route path="templates" element={<TemplatesPage />} />
                <Route path="workflow-rules" element={<WorkflowRulesPage />} />
                <Route path="integrations" element={<IntegrationsPage />} />
                <Route path="data" element={<DataRecordsPage />} />
                <Route path="workflows" element={<WorkflowsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="channels" element={<ChannelsConsolePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" richColors />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
