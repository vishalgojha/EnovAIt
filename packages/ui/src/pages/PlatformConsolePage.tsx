import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Activity, CreditCard, ShieldCheck, RefreshCw, ShieldAlert } from 'lucide-react';

import { BlockGuide } from '@/components/layout/BlockGuide';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminApi } from '@/lib/api/endpoints';
import { useAuthStore } from '@/lib/store/auth';
import { useNavigate } from 'react-router-dom';

const toneFor = (kind: string) => (kind === 'workflow_event' ? 'secondary' as const : 'default' as const);

export function PlatformConsolePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'super_admin';

  const { data: summary, isLoading: isSummaryLoading, refetch: refetchSummary } = useQuery({
    queryKey: ['platform-summary'],
    queryFn: adminApi.getPlatformSummary,
    enabled: isSuperAdmin,
  });

  const { data: logs = [], isLoading: isLogsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['platform-logs'],
    queryFn: () => adminApi.getPlatformLogs({ limit: 8 }),
    enabled: isSuperAdmin,
    refetchInterval: 30_000,
  });

  const { data: approvals = [], isLoading: isApprovalsLoading, refetch: refetchApprovals } = useQuery({
    queryKey: ['platform-approvals'],
    queryFn: () => adminApi.getPlatformApprovals({ limit: 6 }),
    enabled: isSuperAdmin,
    refetchInterval: 30_000,
  });

  if (!isSuperAdmin) {
    return (
      <Card className="rounded-[1.8rem] border-white/70 bg-white/90 shadow-none">
        <CardContent className="flex items-center gap-3 p-6">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <div>
            <p className="text-sm font-semibold">Platform Console is restricted</p>
            <p className="text-xs text-muted-foreground">Only EnovAIt super admins can manage subscriptions and platform logs.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeIntegrations = summary?.activeIntegrations ?? 0;
  const pendingApprovals = summary?.pendingApprovals ?? 0;
  const failedNotifications = summary?.failedNotifications ?? 0;

  return (
    <div className="space-y-6">
      <BlockGuide
        eyebrow="Super admin"
        title="Manage subscriptions, logs, and platform-wide health from one place"
        description="This console is for EnovAIt operators. Use it to keep plans current, watch platform logs, and steer the AI ops layer when the product or build needs attention."
        points={[
          { title: 'Subscription control', detail: 'Track plan tier, renewal window, active tenants, and billing posture for the platform.' },
          { title: 'Live logs', detail: 'Monitor webhook traffic, build warnings, channel health, and audit exports from a single place.' },
          { title: 'Orchestration review', detail: 'Use Archon-backed workflows to keep longer tasks aligned with the filing process.' },
        ]}
        secondaryLabel="Refresh all"
        onSecondaryClick={() => {
          void Promise.all([refetchSummary(), refetchLogs(), refetchApprovals()]);
        }}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-[1.6rem] border-white/70 bg-white/90 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Platform plan</p>
                <p className="mt-2 text-2xl font-semibold">Enterprise</p>
              </div>
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[1.6rem] border-white/70 bg-white/90 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Active integrations</p>
                <p className="mt-2 text-2xl font-semibold">{isSummaryLoading ? '...' : activeIntegrations}</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[1.6rem] border-white/70 bg-white/90 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Pending approvals</p>
                <p className="mt-2 text-2xl font-semibold">{isSummaryLoading ? '...' : pendingApprovals}</p>
              </div>
              <Activity className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[1.6rem] border-white/70 bg-white/90 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Secrets</p>
                <p className="mt-2 text-2xl font-semibold">Controlled</p>
              </div>
              <ShieldAlert className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
        <Card className="rounded-[1.8rem] border-white/70 bg-white/90 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Subscription and log stream</CardTitle>
              <CardDescription>Use this as the source of truth for platform operations.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => void Promise.all([refetchSummary(), refetchLogs(), refetchApprovals()])}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLogsLoading ? (
              <p className="text-sm text-muted-foreground">Loading platform logs...</p>
            ) : logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent platform logs yet.</p>
            ) : (
              logs.map((entry) => (
                <div key={entry.id} className="flex items-start justify-between rounded-2xl bg-muted/35 px-4 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{entry.title}</p>
                      <Badge variant={toneFor(entry.kind)} className="rounded-full">
                        {entry.source}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs leading-6 text-muted-foreground">{entry.detail}</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{entry.status}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{new Date(entry.at).toLocaleString()}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[1.8rem] border-white/70 bg-[#f6f7f4]/90 shadow-none">
          <CardHeader>
            <CardTitle>Archon orchestration</CardTitle>
            <CardDescription>
              Long-running reasoning tasks stay in Archon while EnovAIt keeps the ESG workflow, approvals, and evidence trail product-specific.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Use case</p>
              <p className="mt-2 text-sm font-medium">Draft a BRSR follow-up plan or summarize a filing gap before the reviewer queue is updated.</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Boundary</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Archon handles the reasoning layer; EnovAIt owns the product, permissions, tenant data, and ESG outcomes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[1.8rem] border-white/70 bg-white/90 shadow-none">
        <CardHeader>
          <CardTitle>Secrets environment</CardTitle>
          <CardDescription>Open the controlled env template for Supabase and the active AI provider.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium">Backend `.env` and provider keys live behind super admin access.</p>
            <p className="text-sm text-muted-foreground">Use this to copy the safe template and keep runtime secrets out of the browser.</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard/secrets')}>
            Open secrets environment
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-[1.8rem] border-white/70 bg-white/90 shadow-none">
        <CardHeader>
          <CardTitle>Pending approvals</CardTitle>
          <CardDescription>These are the workflow items humans should clear before the audit window.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isApprovalsLoading ? (
            <p className="text-sm text-muted-foreground">Loading approvals...</p>
          ) : approvals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No pending approvals right now.</p>
          ) : (
            approvals.map((approval) => (
              <div key={approval.id} className="rounded-2xl bg-muted/35 px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{approval.title}</p>
                    <p className="text-xs text-muted-foreground">{approval.summary}</p>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {approval.state}
                  </Badge>
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Updated {new Date(approval.updatedAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
