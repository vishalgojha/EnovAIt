import { motion } from "motion/react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Compass,
  Shield,
  Users,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getRoleLabel, getRolePermissions, getRoleSummary, roleCatalog } from "@/lib/rbac";
import { useAuthStore } from "@/lib/store/auth";
import { useGuidedTour } from "@/components/tour/GuidedTour";

const accessData = [
  { name: "Mon", approvals: 12, escalations: 2 },
  { name: "Tue", approvals: 18, escalations: 3 },
  { name: "Wed", approvals: 14, escalations: 4 },
  { name: "Thu", approvals: 22, escalations: 2 },
  { name: "Fri", approvals: 25, escalations: 1 },
  { name: "Sat", approvals: 9, escalations: 0 },
  { name: "Sun", approvals: 11, escalations: 1 },
];

const queue = [
  {
    title: "Owner approval pending",
    detail: "A privileged integration update is waiting for owner sign-off.",
    status: "critical",
  },
  {
    title: "Manager review requested",
    detail: "A role change for the finance team moved into the approval queue.",
    status: "warning",
  },
  {
    title: "Viewer request completed",
    detail: "Read-only access was granted after policy validation and log capture.",
    status: "resolved",
  },
];

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { startTour } = useGuidedTour();

  const role = user?.role;
  const permissionCount = getRolePermissions(role).length;
  const roleLabel = getRoleLabel(role);
  const roleSummary = getRoleSummary(role);

  const stats = [
    {
      title: "Accessible permissions",
      value: String(permissionCount).padStart(2, "0"),
      change: role ? roleLabel : "Guest",
      trend: "up" as const,
      icon: Shield,
    },
    {
      title: "Open approvals",
      value: "07",
      change: "-2 today",
      trend: "down" as const,
      icon: Clock,
    },
    {
      title: "Privileged roles",
      value: "04",
      change: "+1 this week",
      trend: "up" as const,
      icon: Users,
    },
    {
      title: "Policy checks passed",
      value: "96%",
      change: "+4%",
      trend: "up" as const,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div data-tour-id="dashboard-hero">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            RBAC dashboard
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Access control at a glance
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
            {roleSummary} The current user is <span className="font-medium text-foreground">{roleLabel}</span>.
          </p>
        </div>
        <div className="flex items-center gap-2" data-tour-id="dashboard-actions">
          <Button
            variant="ghost"
            className="h-10 rounded-full border border-[#4A6741]/15 bg-[#4A6741]/5 px-4 text-[#101513] hover:bg-[#4A6741]/10"
            onClick={startTour}
          >
            <Compass className="mr-2 h-4 w-4 text-[#4A6741]" />
            Take tour
          </Button>
          <Button variant="outline" className="h-10 rounded-full border-white/10 bg-white/70">
            <Clock className="mr-2 h-4 w-4" />
            Last 7 days
          </Button>
          <Button className="h-10 rounded-full bg-[#101513] px-4 text-white hover:bg-[#101513]/90">
            Review approvals
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" data-tour-id="dashboard-kpis">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="border-white/60 bg-white/80 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div className="text-2xl font-semibold tracking-tight">{stat.value}</div>
                  <div className={cn("mb-1 flex items-center text-xs font-medium text-emerald-600")}>
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-3 w-3" />
                    )}
                    {stat.change}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_0.9fr]">
        <Card className="border-white/60 bg-white/80 shadow-sm" data-tour-id="dashboard-chart">
          <CardHeader className="border-b border-border/60">
            <CardTitle className="text-xl tracking-tight">Approval flow</CardTitle>
            <CardDescription>
              Daily approvals and escalations across the RBAC control plane.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[340px] p-4 sm:p-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accessData}>
                <defs>
                  <linearGradient id="approvalFill" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="approvals"
                  stroke="#4A6741"
                  strokeWidth={2}
                  fill="url(#approvalFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-[#101513] text-white shadow-sm" data-tour-id="dashboard-ladder">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-xl tracking-tight">Role ladder</CardTitle>
            <CardDescription className="text-white/55">
              A quick view of the access tiers available in this tenant.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {roleCatalog.slice(0, 5).map((item) => (
              <div key={item.role} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{item.label}</p>
                    <p className="mt-1 text-sm leading-6 text-white/60">{item.summary}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="rounded-full border-white/10 bg-white/5 text-[10px] uppercase tracking-[0.2em] text-white/75"
                  >
                    {item.scope}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/60 bg-white/80 shadow-sm" data-tour-id="dashboard-activity">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="text-xl tracking-tight">Recent access activity</CardTitle>
          <CardDescription>Who touched what, and what the system did with it.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 md:grid-cols-3">
          {queue.map((item) => (
            <div key={item.title} className="rounded-3xl border border-border/60 bg-muted/30 p-5">
              <Badge
                variant="outline"
                className={cn(
                  "rounded-full border text-[10px] uppercase tracking-[0.2em]",
                  item.status === "critical"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : item.status === "warning"
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                )}
              >
                {item.status}
              </Badge>
              <h3 className="mt-4 text-base font-semibold tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
