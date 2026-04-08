import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bot,
  Clock,
  Database,
  FileText,
  GitBranch,
  Layers3,
  MessageSquareText,
  Radio,
  SendHorizonal,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { dashboardApi } from '@/lib/api/endpoints';
import { BlockGuide } from '@/components/layout/BlockGuide';
import { useAuthStore } from '@/lib/store/auth';
import { cn } from '@/lib/utils';

const fallbackChartData = [
  { name: 'Jan', records: 0 },
  { name: 'Feb', records: 0 },
  { name: 'Mar', records: 0 },
  { name: 'Apr', records: 0 },
  { name: 'May', records: 0 },
  { name: 'Jun', records: 0 },
];

const onboardingSteps = [
  {
    title: 'Activate your modules',
    description: 'Choose the modules your team will start with first, like ESG, Operations, or Compliance.',
    highlights: ['Enable only the modules needed for your current reporting cycle.', 'Each module can be customized later without data loss.'],
    path: '/dashboard/modules',
    cta: 'Open Modules',
  },
  {
    title: 'Create your first template',
    description: 'Add a conversational template so teams can submit clean, structured records via chat.',
    highlights: ['Start from an existing template and adapt fields quickly.', 'Templates reduce back-and-forth and improve data quality.'],
    path: '/dashboard/templates',
    cta: 'Open Templates',
  },
  {
    title: 'Set your first workflow rule',
    description: 'Automate what should happen when important records come in, like approvals or escalations.',
    highlights: ['Begin with one high-impact trigger and iterate from there.', 'Notifications and tasks run automatically once enabled.'],
    path: '/dashboard/workflow-rules',
    cta: 'Open Workflow Rules',
  },
] as const;

const filingThreads = [
  { name: 'FY 2025-26 BRSR filing', state: 'In progress', delta: '+18 records', tone: 'default' as const },
  { name: 'Vendor value-chain chase', state: 'Awaiting 6 replies', delta: 'WhatsApp live', tone: 'secondary' as const },
  { name: 'Assurance packet v1', state: 'Needs review', delta: '2 missing proofs', tone: 'destructive' as const },
];

const channels = [
  { label: 'WhatsApp', detail: 'Field teams and site managers', icon: MessageSquareText },
  { label: 'Email', detail: 'Policy docs and audit requests', icon: FileText },
  { label: 'Partner API', detail: 'ERP and supplier systems', icon: Radio },
] as const;

export function DashboardPage() {
  const navigate = useNavigate();
  const { tenant, user } = useAuthStore();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [copilotPrompt, setCopilotPrompt] = useState('');

  const { data: overview, isLoading } = useQuery({
    queryKey: ['dashboard-overview', tenant?.id],
    queryFn: dashboardApi.getOverview,
    refetchInterval: 30_000,
  });

  const onboardingStorageKey = useMemo(() => {
    if (!user?.id) {
      return null;
    }
    return `enovait:first-login:${user.id}:v1`;
  }, [user?.id]);

  const chartData = useMemo(() => {
    if (!overview?.chartData?.length) {
      return fallbackChartData;
    }
    return overview.chartData;
  }, [overview?.chartData]);

  useEffect(() => {
    if (!onboardingStorageKey) {
      setIsGuideOpen(false);
      return;
    }

    const hasCompletedOnboarding = window.localStorage.getItem(onboardingStorageKey) === 'done';
    if (!hasCompletedOnboarding) {
      setStepIndex(0);
      setIsGuideOpen(true);
    }
  }, [onboardingStorageKey]);

  const activeOnboardingStep = onboardingSteps[stepIndex];
  const onboardingProgress = ((stepIndex + 1) / onboardingSteps.length) * 100;
  const isLastOnboardingStep = stepIndex === onboardingSteps.length - 1;

  const markOnboardingDone = () => {
    if (onboardingStorageKey) {
      window.localStorage.setItem(onboardingStorageKey, 'done');
    }
    setIsGuideOpen(false);
  };

  const openGuide = () => {
    setStepIndex(0);
    setIsGuideOpen(true);
  };

  const goToOnboardingStep = () => {
    markOnboardingDone();
    navigate(activeOnboardingStep.path);
  };

  const openReadinessWorkspace = () => {
    navigate('/dashboard/readiness');
  };

  const goToNextStep = () => {
    if (isLastOnboardingStep) {
      markOnboardingDone();
      return;
    }
    setStepIndex((previous) => previous + 1);
  };

  const maxRecords = Math.max(1, ...chartData.map((item) => item.records));
  const recentRecords = overview?.recentRecords ?? [];

  const kpiCards = [
    { title: 'Live Modules', value: overview?.modulesCount ?? 0, icon: Layers3, hint: 'BRSR, ESG, workflows' },
    { title: 'Active Templates', value: overview?.templatesCount ?? 0, icon: FileText, hint: 'Journeys collecting data' },
    { title: 'Agent Rules', value: overview?.workflowRulesCount ?? 0, icon: Sparkles, hint: 'Follow-up automations' },
    { title: 'Evidence Records', value: overview?.recordsCount ?? 0, icon: Database, hint: 'Structured source material' },
  ];

  return (
    <div className="space-y-6">
      <BlockGuide
        eyebrow="Command center"
        title="Continuous ESG operations, not quarter-end panic"
        description="This workspace keeps daily and weekly evidence flowing from WhatsApp, email, files, and systems, then shows reviewers where the leaks are before audit time."
        points={[
          { title: 'Ingest every week', detail: 'Teams send source data continuously instead of waiting for the quarter to end.' },
          { title: 'Review exceptions', detail: 'Humans focus on the missing proof and anomalies, not the manual data entry.' },
          { title: 'Stay ready', detail: 'The readiness board keeps the filing live mid-week, not just at audit time.' },
        ]}
        ctaLabel="Open readiness"
        onCtaClick={openReadinessWorkspace}
      />

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="space-y-4">
          <Card className="rounded-[1.7rem] border-white/70 bg-[#f7f5f1]/90 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">Live filing threads</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {filingThreads.map((thread) => (
                <button
                  key={thread.name}
                  className="flex w-full items-start gap-3 rounded-2xl border border-transparent bg-white px-3 py-3 text-left shadow-sm transition-colors hover:border-border"
                >
                  <div className="mt-0.5 rounded-xl bg-accent p-2 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{thread.name}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant={thread.tone} className="h-5 rounded-full px-2 text-[10px]">
                        {thread.state}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{thread.delta}</span>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[1.7rem] border-white/70 bg-[#eef4f4]/90 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Connected channels</CardTitle>
              <CardDescription>Normie-friendly intake across the channels teams already use.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {channels.map((channel) => (
                <div key={channel.label} className="flex items-center gap-3 rounded-2xl bg-white px-3 py-3 shadow-sm">
                  <div className="rounded-xl bg-accent p-2 text-primary">
                    <channel.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{channel.label}</p>
                    <p className="text-xs text-muted-foreground">{channel.detail}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[1.7rem] border-white/70 bg-[#f5efe6]/90 shadow-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Subscription</CardTitle>
              <CardDescription>Growth SaaS tier with multi-entity BRSR coverage.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                <div>
                  <p className="text-sm font-medium">Annual revenue</p>
                  <p className="text-xs text-muted-foreground">Billed monthly</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <WalletCards className="h-4 w-4 text-primary" />
                  INR 29,999
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="overflow-hidden rounded-[2rem] border-white/70 bg-[linear-gradient(180deg,rgba(241,247,247,0.95),rgba(255,255,255,0.94))] shadow-none">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-2xl">
                  <Badge variant="outline" className="rounded-full border-primary/20 bg-white/80 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-primary">
                    SaaS workspace
                  </Badge>
                  <h2 className="mt-4 text-4xl font-semibold tracking-tight text-balance">
                    Calm control center for India-first BRSR reporting
                  </h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
                    EnovAIt turns WhatsApp chats, email trails, ERP exports, and operator updates into filing-ready BRSR narratives,
                    evidence records, and follow-up workflows without making teams learn a new system.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:w-[360px]">
                  <div className="rounded-[1.6rem] bg-white px-4 py-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Readiness</p>
                    <p className="mt-2 text-2xl font-semibold">72%</p>
                    <p className="mt-1 text-xs text-muted-foreground">Section A and B mostly complete</p>
                  </div>
                  <div className="rounded-[1.6rem] bg-white px-4 py-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Response time</p>
                    <p className="mt-2 text-2xl font-semibold">4.6h</p>
                    <p className="mt-1 text-xs text-muted-foreground">Median owner reply across channels</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-[1.8rem] border border-white/80 bg-white/85 p-4 shadow-sm">
                <div className="flex items-center gap-3 border-b border-border/70 pb-3">
                  <div className="rounded-2xl bg-accent p-2 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">EnovAIt Copilot</p>
                    <p className="text-xs text-muted-foreground">Ask for filing progress, owner follow-up, or missing evidence.</p>
                  </div>
                  <Badge variant="outline" className="rounded-full">Assisted</Badge>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                  <div className="space-y-3">
                    <div className="rounded-2xl bg-muted/50 p-4 text-sm leading-7 text-muted-foreground">
                      “Create a follow-up pack for missing Principle 6 water disclosures and notify plant heads over WhatsApp.”
                    </div>
                    <Textarea
                      value={copilotPrompt}
                      onChange={(event) => setCopilotPrompt(event.target.value)}
                      placeholder="Ask EnovAIt to prepare outreach, summarize a filing gap, or draft your next BRSR section..."
                      className="min-h-28 rounded-[1.4rem] border-white bg-background/80 shadow-none"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="rounded-full px-3 py-1">BRSR Copilot</Badge>
                        <Badge variant="secondary" className="rounded-full px-3 py-1">WhatsApp Outreach</Badge>
                        <Badge variant="secondary" className="rounded-full px-3 py-1">Evidence Chase</Badge>
                      </div>
                      <Button className="rounded-full px-5">
                        Send to Copilot
                        <SendHorizonal className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3 rounded-[1.6rem] bg-[#f6f7f3] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Suggested actions</p>
                    {[
                      'Draft Principle 1 training disclosures',
                      'Summarize material issue register',
                      'Send owner nudges for missing evidence',
                    ].map((action) => (
                      <button
                        key={action}
                        className="w-full rounded-2xl bg-white px-3 py-3 text-left text-sm font-medium shadow-sm transition-colors hover:bg-accent"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kpiCards.map((kpi) => (
              <Card key={kpi.title} className="rounded-[1.6rem] border-white/70 bg-white/85 shadow-none">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                    <kpi.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold">{isLoading ? '...' : kpi.value}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <Card className="rounded-[1.7rem] border-white/70 bg-white/85 shadow-none">
              <CardHeader>
                <CardTitle>BRSR readiness board</CardTitle>
                <CardDescription>What has moved this week and what still blocks the annual filing.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {chartData.map((point, index) => (
                  <div key={`${point.name}-${index}`} className="grid gap-3 rounded-2xl bg-muted/45 px-4 py-4 md:grid-cols-[120px_minmax(0,1fr)_auto] md:items-center">
                    <div>
                      <p className="text-sm font-medium">{point.name}</p>
                      <p className="text-xs text-muted-foreground">Reporting period</p>
                    </div>
                    <div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-background">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${Math.min(100, (point.records / maxRecords) * 100)}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {point.records} structured records mapped into the filing spine
                      </p>
                    </div>
                    <Badge variant="outline" className="rounded-full">
                      {point.records > 0 ? 'Progressing' : 'Awaiting input'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-[1.7rem] border-white/70 bg-white/85 shadow-none">
              <CardHeader>
                <CardTitle>Latest evidence</CardTitle>
                <CardDescription>Recent records captured from your live workspace.</CardDescription>
              </CardHeader>
              <CardContent>
                {recentRecords.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    No records available yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentRecords.map((record) => (
                      <div key={record.id} className="flex items-center justify-between rounded-2xl bg-muted/40 px-3 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              'h-2 w-2 rounded-full',
                              record.status === 'final' && 'bg-green-500',
                              record.status === 'draft' && 'bg-amber-500',
                              record.status === 'superseded' && 'bg-slate-500'
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{record.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {record.id.slice(0, 8)} • {record.time}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="capitalize">{record.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}

                <Button variant="ghost" className="mt-4 w-full rounded-2xl text-xs" size="sm">
                  View all evidence records
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-[1.7rem] border-white/70 bg-[#f1f6f6] shadow-none">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">Assurance watch</p>
                    <p className="text-xs text-muted-foreground">2 sections need documentary proof</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-[1.7rem] border-white/70 bg-[#f8f3e9] shadow-none">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <Radio className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">Channel health</p>
                    <p className="text-xs text-muted-foreground">WhatsApp and email are ingesting normally</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-[1.7rem] border-white/70 bg-[#f3f0f8] shadow-none">
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold">Renewal clock</p>
                    <p className="text-xs text-muted-foreground">23 days left in current subscription cycle</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-[1.7rem] border border-white/70 bg-white/80 px-6 py-4 shadow-none">
        <div className="flex items-center gap-3">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Workspace data refreshes every 30 seconds. Last query status:{' '}
            <span className="font-medium text-foreground">
              {isLoading ? 'Loading...' : overview?.backendHealthy ? 'Healthy' : 'Check API/Auth'}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={openGuide}>
            First Login Guide
          </Button>
          <Button variant="outline" size="sm" onClick={openReadinessWorkspace}>
            <ArrowRight className="mr-2 h-4 w-4" />
            Open filing workspace
          </Button>
        </div>
      </div>

      <Dialog open={isGuideOpen} onOpenChange={setIsGuideOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Welcome to EnovAIt</DialogTitle>
            <DialogDescription>
              Let&rsquo;s complete a quick guided setup for {tenant?.name || 'your workspace'}.
            </DialogDescription>
          </DialogHeader>

          <Progress value={onboardingProgress}>
            <ProgressLabel>
              Step {stepIndex + 1} of {onboardingSteps.length}
            </ProgressLabel>
            <ProgressValue>{Math.round(onboardingProgress)}%</ProgressValue>
          </Progress>

          <div className="space-y-3 rounded-lg border bg-muted/40 p-4">
            <h3 className="text-sm font-semibold">{activeOnboardingStep.title}</h3>
            <p className="text-sm text-muted-foreground">{activeOnboardingStep.description}</p>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              {activeOnboardingStep.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          <DialogFooter className="sm:justify-between">
            <Button variant="ghost" onClick={() => setIsGuideOpen(false)}>
              Remind me later
            </Button>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setStepIndex((previous) => Math.max(previous - 1, 0))}
                disabled={stepIndex === 0}
              >
                Previous
              </Button>
              <Button variant="outline" onClick={goToNextStep}>
                {isLastOnboardingStep ? 'Finish' : 'Next'}
              </Button>
              <Button onClick={goToOnboardingStep}>
                {activeOnboardingStep.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
