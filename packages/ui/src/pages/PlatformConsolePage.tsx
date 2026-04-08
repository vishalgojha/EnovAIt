import React from 'react';
import { AlertTriangle, ArrowRight, Activity, Bot, CreditCard, ShieldCheck } from 'lucide-react';

import { BlockGuide } from '@/components/layout/BlockGuide';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/store/auth';

const logStream = [
  { source: 'Billing', detail: 'Subscription renewal scheduled for next cycle', tone: 'default' as const },
  { source: 'Webhook', detail: 'WhatsApp Evolution callback delivered successfully', tone: 'secondary' as const },
  { source: 'Build', detail: 'UI build warning: large chunk threshold exceeded', tone: 'destructive' as const },
  { source: 'Audit', detail: 'Evidence pack exported for review', tone: 'default' as const },
];

export function PlatformConsolePage() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'super_admin';

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

  return (
    <div className="space-y-6">
      <BlockGuide
        eyebrow="Super admin"
        title="Manage subscriptions, logs, and platform-wide health from one place"
        description="This console is for EnovAIt operators. Use it to keep plans current, watch platform logs, and steer the AI ops layer when the product or build needs attention."
        points={[
          {
            title: 'Subscription control',
            detail: 'Track plan tier, renewal window, active tenants, and billing posture for the platform.',
          },
          {
            title: 'Live logs',
            detail: 'Monitor webhook traffic, build warnings, channel health, and audit exports from a single place.',
          },
          {
            title: 'AI supervision',
            detail: 'Review the agent that proposes fixes for client-side and build-side issues before anything ships.',
          },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[1.6rem] border-white/70 bg-white/90 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Platform plan</p>
                <p className="mt-2 text-2xl font-semibold">Enterprise</p>
              </div>
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">Built for multi-tenant ESG reporting, operations, and AI-assisted review.</p>
          </CardContent>
        </Card>
        <Card className="rounded-[1.6rem] border-white/70 bg-white/90 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tenant count</p>
                <p className="mt-2 text-2xl font-semibold">12</p>
              </div>
              <ShieldCheck className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">All subscription and seat data stays governed at the platform layer.</p>
          </CardContent>
        </Card>
        <Card className="rounded-[1.6rem] border-white/70 bg-white/90 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Open actions</p>
                <p className="mt-2 text-2xl font-semibold">7</p>
              </div>
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">Pending fixes, billing changes, and log follow-ups that need human approval.</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
        <Card className="rounded-[1.8rem] border-white/70 bg-white/90 shadow-none">
          <CardHeader>
            <CardTitle>Subscription and log stream</CardTitle>
            <CardDescription>Use this as the source of truth for platform operations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {logStream.map((entry) => (
              <div key={entry.source} className="flex items-start justify-between rounded-2xl bg-muted/35 px-4 py-4">
                <div>
                  <p className="text-sm font-medium">{entry.source}</p>
                  <p className="mt-1 text-xs leading-6 text-muted-foreground">{entry.detail}</p>
                </div>
                <Badge variant={entry.tone}>{entry.source}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[1.8rem] border-white/70 bg-[#f6f7f4]/90 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              EnovAIt AI Agent
            </CardTitle>
            <CardDescription>
              A supervised ops agent that proposes fixes for build warnings, client errors, webhook failures, and repetitive support cases.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current recommendation</p>
              <p className="mt-2 text-sm font-medium">Increase chunk split points on the dashboard bundle and ship the UI patch after review.</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Learning loop</p>
              <p className="mt-2 text-sm text-muted-foreground">
                The agent should learn from repeated client behavior patterns, but keep human approval before any code or tenant-level change lands.
              </p>
            </div>
            <Button className="w-full rounded-2xl">
              Review proposed fixes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[1.8rem] border-white/70 bg-white/90 shadow-none">
        <CardHeader>
          <CardTitle>Platform guidance</CardTitle>
          <CardDescription>How the super-admin layer should be used in the demo.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {[
            'Keep subscription controls visible only to super admins.',
            'Review logs daily so issues are caught before the customer does.',
            'Treat AI fixes as proposals that still need human approval.',
          ].map((point) => (
            <div key={point} className="rounded-2xl bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
              {point}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
