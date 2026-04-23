import { motion } from "motion/react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const kpis = [
  {
    title: "Carbon footprint",
    value: "4,250 tCO2e",
    change: "-2.4%",
    trend: "down" as const,
    icon: Activity,
  },
  {
    title: "Energy intensity",
    value: "12.5 kWh/unit",
    change: "-5.2%",
    trend: "down" as const,
    icon: Zap,
  },
  {
    title: "Readiness score",
    value: "88%",
    change: "+12%",
    trend: "up" as const,
    icon: CheckCircle2,
  },
  {
    title: "Open gaps",
    value: "24",
    change: "-15%",
    trend: "down" as const,
    icon: ShieldAlert,
  },
];

const chartData = [
  { name: "Jan", emissions: 420, readiness: 60 },
  { name: "Feb", emissions: 390, readiness: 62 },
  { name: "Mar", emissions: 410, readiness: 66 },
  { name: "Apr", emissions: 360, readiness: 70 },
  { name: "May", emissions: 330, readiness: 74 },
  { name: "Jun", emissions: 305, readiness: 78 },
  { name: "Jul", emissions: 280, readiness: 81 },
];

const feed = [
  {
    title: "Scope 3 emissions spike",
    detail: "Detected in the Pune plant feed 8 minutes ago",
    status: "critical",
  },
  {
    title: "Water intake variance",
    detail: "Requested reviewer confirmation from the operations team",
    status: "warning",
  },
  {
    title: "Section B narrative complete",
    detail: "Ready for leadership sign-off",
    status: "resolved",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            Workspace overview
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            ESG intelligence at a glance
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
            A live view of risk, readiness, and evidence coverage across the active workspace.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10 rounded-full border-white/10 bg-white/70">
            <Clock className="mr-2 h-4 w-4" />
            Last 30 days
          </Button>
          <Button className="h-10 rounded-full bg-[#101513] px-4 text-white hover:bg-[#101513]/90">
            Generate filing pack
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="border-white/60 bg-white/80 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <kpi.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div className="text-2xl font-semibold tracking-tight">{kpi.value}</div>
                  <div
                    className={cn(
                      "mb-1 flex items-center text-xs font-medium text-emerald-600"
                    )}
                  >
                    {kpi.trend === "up" ? (
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-3 w-3" />
                    )}
                    {kpi.change}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_0.9fr]">
        <Card className="border-white/60 bg-white/80 shadow-sm">
          <CardHeader className="border-b border-border/60">
            <CardTitle className="text-xl tracking-tight">Readiness trend</CardTitle>
            <CardDescription>
              Emissions are falling while workspace readiness improves.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[340px] p-4 sm:p-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="readinessFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A6741" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#4A6741" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                <YAxis tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "16px",
                    boxShadow: "0 20px 60px -30px rgba(16, 21, 19, 0.35)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="readiness"
                  stroke="#4A6741"
                  strokeWidth={2}
                  fill="url(#readinessFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-[#101513] text-white shadow-sm">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-xl tracking-tight">Recent detections</CardTitle>
            <CardDescription className="text-white/55">
              AI-flagged issues flowing through the workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {feed.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-sm leading-6 text-white/60">{item.detail}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full border-white/10 text-[10px] uppercase tracking-[0.2em]",
                      item.status === "critical"
                        ? "bg-red-500/10 text-red-200"
                        : item.status === "warning"
                          ? "bg-amber-500/10 text-amber-200"
                          : "bg-emerald-500/10 text-emerald-200"
                    )}
                  >
                    {item.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/60 bg-white/80 shadow-sm">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="text-xl tracking-tight">Operational signals</CardTitle>
          <CardDescription>Where the workspace is spending attention this week.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 md:grid-cols-3">
          {[
            {
              title: "Evidence coverage",
              value: "91%",
              description: "Coverage across current reporting entities",
            },
            {
              title: "Review cycle",
              value: "3.4h",
              description: "Average time from intake to review",
            },
            {
              title: "Open escalations",
              value: "6",
              description: "Items requiring human attention today",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-border/60 bg-muted/30 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                {item.title}
              </p>
              <div className="mt-4 text-3xl font-semibold tracking-tight">{item.value}</div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
