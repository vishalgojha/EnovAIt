import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { 
  Activity, 
  Users, 
  Zap, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const kpiData = [
  { title: 'Carbon Footprint', value: '4,250 tCO2e', change: '-2.4%', trend: 'down', icon: Activity },
  { title: 'Energy Intensity', value: '12.5 kWh/unit', change: '-5.2%', trend: 'down', icon: Zap },
  { title: 'BRSR Readiness', value: '88%', change: '+12%', trend: 'up', icon: CheckCircle2 },
  { title: 'Data Gaps Flagged', value: '24', change: '-15%', trend: 'down', icon: AlertCircle },
];

const chartData = [
  { name: 'Jan', emissions: 400, energy: 240 },
  { name: 'Feb', emissions: 300, energy: 139 },
  { name: 'Mar', emissions: 200, energy: 980 },
  { name: 'Apr', emissions: 278, energy: 390 },
  { name: 'May', emissions: 189, energy: 480 },
  { name: 'Jun', emissions: 239, energy: 380 },
  { name: 'Jul', emissions: 349, energy: 430 },
];

const recentWorkflows = [
  { id: 'LK-001', name: 'Scope 3 Emission Leak', status: 'critical', time: '2 mins ago' },
  { id: 'LK-002', name: 'Water Consumption Anomaly', status: 'warning', time: '5 mins ago' },
  { id: 'LK-003', name: 'BRSR Section B Gap', status: 'resolved', time: '12 mins ago' },
  { id: 'LK-004', name: 'Energy Meter Disconnect', status: 'critical', time: '15 mins ago' },
];

import { Database, FileText } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';

export function DashboardPage() {
  const { tenant } = useAuthStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ESG Intelligence Overview</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of sustainability operations for {tenant?.name || 'your organization'}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Clock className="mr-2 h-4 w-4" />
            Last 30 Days
          </Button>
          <Button size="sm">Generate Audit-Ready BRSR</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className={cn(
                  "text-xs font-medium flex items-center",
                  kpi.trend === 'up' ? "text-green-500" : kpi.trend === 'down' ? "text-green-500" : "text-muted-foreground"
                )}>
                  {kpi.trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : kpi.trend === 'down' ? <ArrowDownRight className="h-3 w-3 mr-1" /> : null}
                  {kpi.change}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Sustainability Performance</CardTitle>
            <CardDescription>Carbon emissions vs. energy consumption across all entities.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="emissions" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorEmissions)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Leak Detections</CardTitle>
            <CardDescription>AI-flagged anomalies in your operations data.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentWorkflows.map((wf) => (
                <div key={wf.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      wf.status === 'critical' ? "bg-red-500" : wf.status === 'warning' ? "bg-amber-500" : "bg-green-500"
                    )} />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{wf.name}</span>
                      <span className="text-xs text-muted-foreground">{wf.id} • {wf.time}</span>
                    </div>
                  </div>
                  <Badge variant={wf.status === 'critical' ? 'destructive' : wf.status === 'warning' ? 'secondary' : 'outline'} className="capitalize">
                    {wf.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-xs" size="sm">
              View All Detections
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { cn } from '@/lib/utils';
