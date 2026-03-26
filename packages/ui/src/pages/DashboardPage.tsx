import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
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

export function DashboardPage() {
  const { tenant } = useAuthStore();

  const { data: overview, isLoading } = useQuery({
    queryKey: ['dashboard-overview', tenant?.id],
    queryFn: dashboardApi.getOverview,
    refetchInterval: 30_000,
  });

  const chartData = useMemo(() => {
    if (!overview?.chartData?.length) {
      return fallbackChartData;
    }
    return overview.chartData;
  }, [overview?.chartData]);

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
    </div>
  );
}
