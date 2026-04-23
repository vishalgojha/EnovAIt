import { CheckCircle2, FileText, Globe2, ShieldCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const frameworks = [
  { name: "SEBI BRSR Core", progress: 92, status: "Ready", type: "Mandatory" },
  { name: "GRI Standards", progress: 65, status: "In progress", type: "Voluntary" },
  { name: "TCFD Disclosures", progress: 40, status: "Action needed", type: "Voluntary" },
  { name: "SASB Sector Specific", progress: 10, status: "Not started", type: "Voluntary" },
];

export default function ReadinessPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
          Readiness
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
          Compliance readiness snapshot
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
          A quick read on where the workspace is ready, where evidence is missing, and what still needs attention.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/60 bg-white/80 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Aggregate readiness
            </p>
            <div className="mt-4 text-3xl font-semibold tracking-tight">76%</div>
            <Progress value={76} className="mt-4 h-2" />
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-white/80 shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Critical gaps
            </p>
            <div className="mt-4 text-3xl font-semibold tracking-tight">08</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge className="rounded-full bg-red-50 text-red-700 hover:bg-red-50">Energy</Badge>
              <Badge className="rounded-full bg-red-50 text-red-700 hover:bg-red-50">Emissions</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-[#101513] text-white shadow-sm">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
              Verified metrics
            </p>
            <div className="mt-4 text-3xl font-semibold tracking-tight">142</div>
            <div className="mt-4 flex items-center gap-2">
              <div className="rounded-full bg-white/10 p-2">
                <ShieldCheck className="h-4 w-4 text-[#8ab37c]" />
              </div>
              <span className="text-sm text-white/65">
                Structured and traceable across entities
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-white/60 bg-white/80 shadow-sm">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="text-xl tracking-tight">Framework comparison</CardTitle>
          <CardDescription>Coverage and status across reporting standards.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-5">
          {frameworks.map((framework) => (
            <div key={framework.name} className="space-y-3 rounded-3xl border border-border/60 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-medium tracking-tight">{framework.name}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {framework.type}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{framework.progress}%</div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "mt-2 rounded-full text-[10px] uppercase tracking-[0.2em]",
                      framework.progress > 80
                        ? "bg-emerald-50 text-emerald-700"
                        : framework.progress > 40
                          ? "bg-blue-50 text-blue-700"
                          : "bg-muted/50 text-muted-foreground"
                    )}
                  >
                    {framework.status}
                  </Badge>
                </div>
              </div>
              <Progress value={framework.progress} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-white/60 bg-white/80 shadow-sm">
          <CardHeader className="border-b border-border/60">
            <CardTitle className="text-xl tracking-tight">Regional mapping</CardTitle>
            <CardDescription>Coverage by geography and operating entity.</CardDescription>
          </CardHeader>
          <CardContent className="grid min-h-56 place-items-center p-5">
            <div className="text-center">
              <Globe2 className="mx-auto h-7 w-7 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                Regional mapping active across India, APAC, and EMEA.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/60 bg-[#101513] text-white shadow-sm">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-xl tracking-tight">Audit-ready snapshot</CardTitle>
            <CardDescription className="text-white/55">
              Package the current state for leadership or assurance partners.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {[
              "Evidence coverage above 90%",
              "No unresolved critical gaps",
              "Review queue within target SLA",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <CheckCircle2 className="h-4 w-4 text-[#8ab37c]" />
                <span className="text-sm text-white/75">{item}</span>
              </div>
            ))}
            <Button className="h-11 rounded-full bg-[#4A6741] px-5 text-white hover:bg-[#4A6741]/90">
              Generate intelligence report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
