import React from 'react';
import { AlertTriangle, Bot, CheckCircle2, RefreshCw, Sparkles, Wrench } from 'lucide-react';

import { BlockGuide } from '@/components/layout/BlockGuide';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const issues = [
  {
    title: 'UI bundle warning',
    detail: 'The AI agent suggests deferring non-essential charts and keeping the demo shell fast.',
    status: 'review',
  },
  {
    title: 'Webhook retries',
    detail: 'Repeated provider failures should trigger a retry policy before support notices pile up.',
    status: 'queued',
  },
  {
    title: 'Client usability gap',
    detail: 'The agent can detect confusion from repeated navigation or abandoned uploads and suggest UI fixes.',
    status: 'learning',
  },
];

export function AIOpsPage() {
  return (
    <div className="space-y-6">
      <BlockGuide
        eyebrow="AI Ops"
        title="The AI agent watches build, client, and support signals, then proposes fixes"
        description="This is the supervised self-improvement layer. It should learn from repeated user behavior and recurring operational issues, but it should always route high-risk changes through a human reviewer."
        points={[
          {
            title: 'Find recurring issues',
            detail: 'Detect repeated build warnings, failing webhooks, or customer journeys that keep stalling.',
          },
          {
            title: 'Suggest safe fixes',
            detail: 'Produce ranked recommendations with clear impact, risk, and rollout notes.',
          },
          {
            title: 'Learn from behavior',
            detail: 'Track what users keep clicking, dropping, or retrying so the product can improve over time.',
          },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[1.6rem] border-white/70 bg-white/90 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Auto-fixes proposed</p>
                <p className="mt-2 text-2xl font-semibold">8</p>
              </div>
              <Bot className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[1.6rem] border-white/70 bg-white/90 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Requires approval</p>
                <p className="mt-2 text-2xl font-semibold">3</p>
              </div>
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-[1.6rem] border-white/70 bg-white/90 shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Learned patterns</p>
                <p className="mt-2 text-2xl font-semibold">14</p>
              </div>
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[1.8rem] border-white/70 bg-white/90 shadow-none">
        <CardHeader>
          <CardTitle>Proposed fixes</CardTitle>
          <CardDescription>Human review stays in the loop for every change that touches production.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {issues.map((issue) => (
            <div key={issue.title} className="flex items-start justify-between rounded-2xl bg-muted/35 px-4 py-4">
              <div>
                <p className="text-sm font-medium">{issue.title}</p>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">{issue.detail}</p>
              </div>
              <Badge variant="outline" className="rounded-full capitalize">
                {issue.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="rounded-[1.8rem] border-white/70 bg-[#f6f7f4]/90 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-primary" />
              Self-healing loop
            </CardTitle>
            <CardDescription>
              The agent reads signals, drafts a fix, and waits for an operator to approve the action.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
              <p className="text-sm font-medium">1. Detect</p>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">Observe build errors, client crashes, and user drop-offs.</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
              <p className="text-sm font-medium">2. Recommend</p>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">Suggest the safest next action with risk and benefit notes.</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
              <p className="text-sm font-medium">3. Learn</p>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">Capture which remediation paths worked so future recommendations improve.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[1.8rem] border-white/70 bg-white/90 shadow-none">
          <CardHeader>
            <CardTitle>Ready state</CardTitle>
            <CardDescription>Use this to decide whether the agent should suggest, pause, or escalate.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-4 text-emerald-900">
              <CheckCircle2 className="h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Safe changes</p>
                <p className="text-xs">Low-risk copy, routing, or alert changes can be proposed quickly.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-blue-50 px-4 py-4 text-blue-900">
              <RefreshCw className="h-4 w-4" />
              <div>
                <p className="text-sm font-medium">Needs validation</p>
                <p className="text-xs">Client behavior patterns should be reviewed before any workflow is changed.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
