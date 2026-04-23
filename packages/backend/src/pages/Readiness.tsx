import { CheckCircle2, FileLock2, ShieldAlert, Workflow } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const policyChecks = [
  { name: "MFA required for privileged roles", progress: 100, status: "Ready" },
  { name: "Approval chain documented", progress: 88, status: "In review" },
  { name: "Quarterly role recertification", progress: 72, status: "Needs action" },
  { name: "Service account ownership", progress: 54, status: "Needs action" },
];

const approvals = [
  "Owner approval required for new admin roles",
  "Manager review required for elevated workflows",
  "Viewer requests auto-expire after 30 days",
];

export default function ApprovalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
          Policies and approvals
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Guardrails for access changes
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
          This page captures the policy posture that sits behind RBAC changes, privileged access,
          and review queues.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/60 bg-white/80 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Policy coverage
            </p>
            <div className="mt-4 text-3xl font-semibold tracking-tight">84%</div>
            <Progress value={84} className="mt-4 h-2" />
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-white/80 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Pending approvals
            </p>
            <div className="mt-4 text-3xl font-semibold tracking-tight">07</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className="rounded-full bg-amber-50 text-amber-700 hover:bg-amber-50">
                Manager
              </Badge>
              <Badge className="rounded-full bg-red-50 text-red-700 hover:bg-red-50">
                Owner
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-[#101513] text-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
              Audit posture
            </p>
            <div className="mt-4 text-3xl font-semibold tracking-tight">Good</div>
            <div className="mt-4 flex items-center gap-2">
              <div className="rounded-full bg-white/10 p-2">
                <FileLock2 className="h-4 w-4 text-[#8ab37c]" />
              </div>
              <span className="text-sm text-white/65">
                Privileged actions are traceable and reviewable
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/60 bg-white/80 shadow-sm">
          <CardHeader className="border-b border-border/60">
            <CardTitle className="text-xl tracking-tight">Policy checklist</CardTitle>
            <CardDescription>
              The controls that should be true before a role change is approved.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 p-5">
            {policyChecks.map((item) => (
              <div key={item.name} className="space-y-3 rounded-3xl border border-border/60 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Workflow className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium tracking-tight">{item.name}</div>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                        RBAC control
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{item.progress}%</div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "mt-2 rounded-full text-[10px] uppercase tracking-[0.2em]",
                        item.progress > 80
                          ? "bg-emerald-50 text-emerald-700"
                          : item.progress > 60
                            ? "bg-amber-50 text-amber-700"
                            : "bg-muted/50 text-muted-foreground"
                      )}
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
                <Progress value={item.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-[#101513] text-white shadow-sm">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-xl tracking-tight">Approval rules</CardTitle>
            <CardDescription className="text-white/55">
              The default approval rules that gate changes to access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {approvals.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <CheckCircle2 className="h-4 w-4 text-[#8ab37c]" />
                <span className="text-sm text-white/75">{item}</span>
              </div>
            ))}
            <Button className="h-11 rounded-full bg-[#4A6741] px-5 text-white hover:bg-[#4A6741]/90">
              Review access policy
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/60 bg-white/80 shadow-sm">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="text-xl tracking-tight">Escalation signals</CardTitle>
          <CardDescription>
            Items that need a human reviewer before a permission change can be finalized.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 md:grid-cols-3">
          {[
            "New admin access outside business hours",
            "Role change without an owner approver",
            "Privileged access request missing justification",
          ].map((item) => (
            <div key={item} className="rounded-3xl border border-border/60 bg-muted/30 p-5">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{item}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
