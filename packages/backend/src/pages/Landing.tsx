import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileText,
  Globe,
  MessageSquare,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: MessageSquare,
    title: "Conversational capture",
    description:
      "Teams log evidence in chat instead of spreadsheets, so reporting starts at the source.",
  },
  {
    icon: FileText,
    title: "Audit-ready reporting",
    description:
      "Disclosures, narratives, and filing packs are organized for BRSR and internal review.",
  },
  {
    icon: Shield,
    title: "Leak detection",
    description:
      "Anomalies and missing evidence are surfaced before they become audit issues.",
  },
  {
    icon: Zap,
    title: "Workflow automation",
    description:
      "Approvals, reminders, and escalation rules move automatically through the workspace.",
  },
  {
    icon: Globe,
    title: "Works across channels",
    description:
      "WhatsApp, email, ERP data, and web workflows feed the same operating model.",
  },
  {
    icon: CheckCircle2,
    title: "Decision-ready metrics",
    description:
      "Leadership sees readiness, coverage, and confidence signals in one place.",
  },
];

const stats = [
  { label: "entities monitored", value: "48" },
  { label: "records ingested", value: "1.2M" },
  { label: "gaps surfaced", value: "324" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(74,103,65,0.12),transparent_35%),linear-gradient(180deg,#fbfbf8_0%,#f3f5f1_100%)] text-foreground">
      <header className="sticky top-0 z-30 border-b border-black/5 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#101513] font-semibold text-white">
              E
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight">EnovAIt</p>
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                ESG operations platform
              </p>
            </div>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#flow" className="transition-colors hover:text-foreground">
              Workflow
            </a>
            <a href="#signal" className="transition-colors hover:text-foreground">
              Signal
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="rounded-full px-4">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild className="rounded-full bg-[#101513] px-4 text-white hover:bg-[#101513]/90">
              <Link to="/dashboard">
                Open workspace
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <Badge className="rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-[11px] uppercase tracking-[0.24em] text-primary hover:bg-primary/5">
              AI layer for ESG operations
            </Badge>
            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
                Catch ESG leaks before the audit does.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                EnovAIt turns evidence capture, review, and reporting into one live
                operating system for sustainability teams.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 rounded-full bg-[#101513] px-6 text-white hover:bg-[#101513]/90">
                <Link to="/dashboard">
                  Launch workspace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-full border-black/10 bg-white/70 px-6 backdrop-blur"
              >
                View demo flow
              </Button>
            </div>
            <div className="grid max-w-xl grid-cols-3 gap-4 pt-4">
              {stats.map((stat) => (
                <Card key={stat.label} className="border-white/50 bg-white/70 shadow-sm">
                  <CardContent className="p-4">
                    <div className="text-2xl font-semibold tracking-tight">{stat.value}</div>
                    <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -left-10 top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-12 right-0 h-44 w-44 rounded-full bg-black/5 blur-3xl" />
            <div className="relative rounded-[2rem] border border-black/5 bg-[#101513] p-5 text-white shadow-[0_40px_120px_-50px_rgba(16,21,19,0.8)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-red-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <div className="rounded-full bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-white/60">
                  Live workspace
                </div>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <BarChart3 className="h-6 w-6 text-[#8ab37c]" />
                  <div className="mt-8 h-3 w-24 rounded-full bg-white/10" />
                  <div className="mt-3 h-2 w-32 rounded-full bg-white/5" />
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <Shield className="h-6 w-6 text-white/65" />
                  <div className="mt-8 h-3 w-20 rounded-full bg-white/10" />
                  <div className="mt-3 h-2 w-28 rounded-full bg-white/5" />
                </div>
              </div>
              <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.24em] text-white/55">
                    Intake stream
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.24em] text-[#8ab37c]">
                    24 active rules
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    "WhatsApp message logged as evidence",
                    "Scope 2 gap flagged for review",
                    "Narrative summary generated",
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/80"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="features" className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-16">
          <div className="mb-10 max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              The product
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Built to keep ESG work moving, not waiting on spreadsheets.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.04 }}
              >
                <Card className="h-full border-white/60 bg-white/75 shadow-sm backdrop-blur">
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-lg font-semibold tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="signal" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
          <Card className="border-white/60 bg-white/75 shadow-sm">
            <CardContent className="grid gap-4 p-6 md:grid-cols-3">
              {[
                { title: "92%", label: "coverage across active entities" },
                { title: "24 min", label: "average time to flag a gap" },
                { title: "3 channels", label: "capturing evidence right now" },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-border/60 bg-muted/20 p-5">
                  <div className="text-3xl font-semibold tracking-tight">{item.title}</div>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section id="flow" className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-4 lg:grid-cols-3">
            {[
              {
                step: "1",
                title: "Capture evidence",
                description:
                  "Teams submit data from WhatsApp, email, or the web as work happens.",
              },
              {
                step: "2",
                title: "Validate and flag",
                description:
                  "Rules and AI surface missing or inconsistent evidence instantly.",
              },
              {
                step: "3",
                title: "Package for review",
                description:
                  "The workspace assembles audit-ready summaries, narratives, and exports.",
              },
            ].map((item) => (
              <Card key={item.title} className="border-white/60 bg-white/75 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#101513] text-sm font-semibold text-white">
                    {item.step}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
