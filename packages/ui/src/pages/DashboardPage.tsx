import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Database,
  FileText,
  Layers3,
  Server,
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
import { dashboardApi } from '@/lib/api/endpoints';
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

export function DashboardPage() {
  const navigate = useNavigate();
  const { tenant, user } = useAuthStore();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

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

  const goToNextStep = () => {
    if (isLastOnboardingStep) {
      markOnboardingDone();
      return;
    }
    setStepIndex((previous) => previous + 1);
  };

  const kpiCards = [
    {
      title: 'Connected Modules',
      value: overview?.modulesCount ?? 0,
      icon: Layers3,
      hint: 'Admin modules currently configured',
    },
    {
      title: 'Templates',
      value: overview?.templatesCount ?? 0,
      icon: FileText,
      hint: 'Question flows and schemas',
    },
    {
      title: 'Workflow Rules',
      value: overview?.workflowRulesCount ?? 0,
      icon: CheckCircle2,
      hint: 'Automation rules currently active',
    },
    {
      title: 'Data Records',
      value: overview?.recordsCount ?? 0,
      icon: Database,
      hint: 'Records ingested and stored',
    },
  ];

  const recentRecords = overview?.recentRecords ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Control Dashboard</h1>
          <p className="text-muted-foreground">
            Live operational overview for {tenant?.name || 'your organization'}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={overview?.backendHealthy ? 'outline' : 'destructive'} className="gap-1">
            <Server className="h-3.5 w-3.5" />
            {overview?.backendHealthy ? 'Backend Connected' : 'Backend Unreachable'}
          </Badge>
          <Button variant="ghost" size="sm" onClick={openGuide}>
            First Login Guide
          </Button>
          <Button variant="outline" size="sm">
            <Clock className="mr-2 h-4 w-4" />
            Auto-refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{isLoading ? '...' : kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Records Trend</CardTitle>
            <CardDescription>Monthly data record volume from the backend.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRecords" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="records" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRecords)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Records</CardTitle>
            <CardDescription>Latest records fetched from `/data/records`.</CardDescription>
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
                  <div key={record.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          record.status === 'final' && 'bg-green-500',
                          record.status === 'draft' && 'bg-amber-500',
                          record.status === 'superseded' && 'bg-slate-500',
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{record.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {record.id.slice(0, 8)} • {record.time}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {record.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            <Button variant="ghost" className="w-full mt-4 text-xs" size="sm">
              View Data Records
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Dashboard data refreshes every 30 seconds. Last query status:{' '}
              <span className="font-medium text-foreground">
                {isLoading ? 'Loading...' : overview?.backendHealthy ? 'Healthy' : 'Check API/Auth'}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

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

          <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
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
