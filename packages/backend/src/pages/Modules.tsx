import { useState } from "react";
import { ExternalLink, Package, Cpu, Leaf, Scale, Users2, ShieldCheck, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const modules = [
  {
    id: "brsr",
    title: "BRSR Core",
    description: "SEBI-mandated disclosures with structured evidence and review checks.",
    icon: ShieldCheck,
    status: "Active",
    category: "Compliance",
    tone: "emerald",
  },
  {
    id: "workbench",
    title: "ESG Workbench",
    description: "Centralize emissions, policies, and narrative inputs across entities.",
    icon: Package,
    status: "Active",
    category: "Strategic",
    tone: "blue",
  },
  {
    id: "carbon",
    title: "Carbon Accounting",
    description: "Scope 1, 2, and 3 data capture with validation and trend tracking.",
    icon: Leaf,
    status: "Active",
    category: "Environment",
    tone: "green",
  },
  {
    id: "value-chain",
    title: "Value Chain ESG",
    description: "Vendor and supplier intake for supply chain sustainability work.",
    icon: Cpu,
    status: "Setup Required",
    category: "Operational",
    tone: "amber",
  },
  {
    id: "governance",
    title: "Corporate Governance",
    description: "Board composition, policy evidence, and control tracking.",
    icon: Scale,
    status: "Active",
    category: "Governance",
    tone: "violet",
  },
  {
    id: "people",
    title: "Diversity & Inclusion",
    description: "Workforce and social metrics with role-based review workflows.",
    icon: Users2,
    status: "Active",
    category: "Social",
    tone: "pink",
  },
];

export default function ModulesPage() {
  const [query, setQuery] = useState("");

  const visibleModules = modules.filter((module) =>
    `${module.title} ${module.description} ${module.category}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            Modules
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Active capabilities
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
            A modular workspace for each part of the ESG operating model.
          </p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Filter modules..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-11 border-white/10 bg-white/70 pl-10 shadow-sm"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleModules.map((module) => (
          <Card key={module.id} className="border-white/60 bg-white/80 shadow-sm">
            <CardHeader className="border-b border-border/60">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm",
                      module.tone === "emerald" && "bg-emerald-600",
                      module.tone === "blue" && "bg-blue-600",
                      module.tone === "green" && "bg-[#4A6741]",
                      module.tone === "amber" && "bg-amber-500",
                      module.tone === "violet" && "bg-violet-600",
                      module.tone === "pink" && "bg-pink-600"
                    )}
                  >
                    <module.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="text-lg tracking-tight">{module.title}</CardTitle>
                    <CardDescription className="mt-1 text-sm leading-6">
                      {module.description}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="rounded-full bg-muted/50 text-[10px] uppercase tracking-[0.2em]">
                  {module.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <Badge className="rounded-full border border-primary/15 bg-primary/5 text-[10px] uppercase tracking-[0.2em] text-primary hover:bg-primary/5">
                {module.category}
              </Badge>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Configured for live intake</span>
                <Button variant="ghost" size="sm" className="rounded-full px-3 text-primary">
                  Open
                  <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
