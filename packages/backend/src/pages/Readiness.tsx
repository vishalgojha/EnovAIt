import { CheckCircle2, FileLock2, ShieldAlert, Workflow } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const policyChecks = [
  { name: "Two-step sign-in is required for high-access roles", progress: 100, status: "Ready" },
  { name: "Each request has a clear approval path", progress: 88, status: "Being updated" },
  { name: "Access is reviewed on a regular schedule", progress: 72, status: "Needs attention" },
  { name: "Every shared account has a clear owner", progress: 54, status: "Needs attention" },
];

const approvals = [
  "New admin access needs owner approval",
  "Sensitive changes need manager review",
  "View-only access ends after 30 days",
];

export default function ApprovalsPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
          Requests
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Reviews before access changes go live
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
          These checks help the team make safe changes, route requests to the right people, and keep a clear record.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/60 bg-white/80 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Checks in place
            </p>
            <div className="mt-4 text-3xl font-semibold tracking-tight">84%</div>
            <Progress value={84} className="mt-4 h-2" />
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-white/80 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Waiting for review
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
              Record keeping
            </p>
            <div className="mt-4 text-3xl font-semibold tracking-tight">Good</div>
            <div className="mt-4 flex items-center gap-2">
              <div className="rounded-full bg-white/10 p-2">
                <FileLock2 className="h-4 w-4 text-[#8ab37c]" />
              </div>
              <span className="text-sm text-white/65">
                Important changes stay easy to review later
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-white/60 bg-white/80 shadow-sm">
          <CardHeader className="border-b border-border/60">
            <CardTitle className="text-xl tracking-tight">Before you approve</CardTitle>
            <CardDescription>
              Use these checks before you give someone new access or make a big change.
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
                        Safety check
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
            <CardTitle className="text-xl tracking-tight">How requests are handled</CardTitle>
            <CardDescription className="text-white/55">
              The usual path requests follow before anything changes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {approvals.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <CheckCircle2 className="h-4 w-4 text-[#8ab37c]" />
                <span className="text-sm text-white/75">{item}</span>
              </div>
            ))}
            <Button
              className="h-11 rounded-full bg-[#4A6741] px-5 text-white hover:bg-[#4A6741]/90"
              onClick={() => navigate("/roles")}
            >
              See access roles
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/60 bg-white/80 shadow-sm">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="text-xl tracking-tight">Needs extra review</CardTitle>
          <CardDescription>
            These are the kinds of requests that should be checked by a person before they move forward.
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
