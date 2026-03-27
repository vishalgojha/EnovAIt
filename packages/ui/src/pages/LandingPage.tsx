import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Shield, 
  Globe, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle2,
  Play,
  Github,
  Twitter,
  Linkedin,
  FileText,
  Sparkles,
  BellRing,
  BadgeCheck,
  Bot,
  User
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const features = [
  {
    title: 'Conversational Data Capture',
    description: 'Field workers and teams log energy, waste, water, and more by simple chat on WhatsApp, Teams, or web. No forms. No training needed.',
    icon: MessageSquare,
  },
  {
    title: 'Real-Time ESG Reporting',
    description: 'Automated BRSR (and GRI) reports generated from your operational data. Always accurate and audit-ready.',
    icon: FileText,
  },
  {
    title: 'Leak Detection',
    description: 'AI flags anomalies and risks — like Scope 2 emissions spikes — before they become audit findings or consultant surprises.',
    icon: Shield,
  },
  {
    title: 'Workflow Automation',
    description: 'Approvals, escalations, and notifications happen automatically. No more chasing follow-up emails.',
    icon: Zap,
  },
  {
    title: 'Works Where Your Teams Work',
    description: 'Data flows in from WhatsApp, Teams, Gmail, ERP systems, or the web — all unified in one secure platform.',
    icon: Globe,
  },
  {
    title: 'Decision-Ready Insights',
    description: 'Turn fragmented operations data into confident sustainability decisions with AI-powered benchmarking.',
    icon: CheckCircle2,
  },
];

const integrations = [
  'WhatsApp', 'Microsoft Teams', 'SAP', 'Oracle', 'Salesforce', 'Workday', 'IoT Sensors', 'HRMS'
];

const pricing = [
  {
    name: 'Starter',
    price: '₹9,999',
    description: 'Perfect for single-entity BRSR reporting.',
    features: ['Up to 3 Sites (Plants/Facilities)', '5,000 Records/mo', 'Core BRSR Reporting', 'Email Support'],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Growth',
    price: '₹29,999',
    description: 'For enterprises with multiple subsidiaries.',
    features: ['Up to 20 Sites', 'Unlimited Records', 'Anomaly Detection + AI Insights', 'Priority Support', '2 Months Free (Annual)'],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'ESG intelligence for global organizations.',
    features: ['Unlimited Sites', 'Custom Frameworks', 'White-label Reports', 'Dedicated Success Manager', 'SLA Guarantees'],
    cta: 'Contact Sales',
    popular: false,
  },
];

const demoScenarios = {
  esg: {
    label: 'ESG',
    title: 'Scope 2 Emissions Spike at Pune Plant',
    context:
      'A plant manager sends utility updates over WhatsApp. EnovAIt detects an intensity jump versus baseline and triggers review.',
    conversation: [
      { role: 'user', text: 'Pune Plant electricity for March: 4,82,000 kWh. Production: 10,600 MT.' },
      { role: 'assistant', text: 'Captured. Last month was 3,61,000 kWh for 10,900 MT. Please confirm if any new lines ran this month.' },
      { role: 'user', text: 'Yes, Line-3 commissioning trial ran for 9 days.' },
      { role: 'assistant', text: 'Logged. I marked this as a high-variance energy event and created an approval workflow for ESG lead.' },
    ],
    extracted: [
      'facility: Pune Plant',
      'period: 2026-03',
      'electricity_kwh: 482000',
      'production_mt: 10600',
      'energy_intensity_kwh_per_mt: 45.47',
      'variance_vs_baseline: +31.6%',
      'variance_reason: line_commissioning_trial',
    ],
    outcomes: [
      'Workflow: Pending approval from ESG lead',
      'Notification sent to Sustainability + Operations heads',
      'BRSR narrative draft updated with contextual explanation',
    ],
    reportPreview: 'BRSR Section B, Principle 6 now includes energy anomaly context and corrective action trail.',
  },
  operations: {
    label: 'Operations',
    title: 'Maintenance Escalation from Voice Transcript',
    context:
      'Site supervisor logs a safety-critical compressor issue by voice. EnovAIt extracts structured fields and routes for immediate action.',
    conversation: [
      { role: 'user', text: 'Night shift report: compressor C-12 temperature crossed 102C twice. Temporary cooldown done.' },
      { role: 'assistant', text: 'Noted. Was production impacted and is there a recurring pattern from the last 7 days?' },
      { role: 'user', text: 'Production slowed by 18 minutes. Same alarm happened two times this week.' },
      { role: 'assistant', text: 'Understood. Severity set to High. Escalation task opened for maintenance manager with SLA of 2 hours.' },
    ],
    extracted: [
      'asset_id: C-12',
      'issue_type: overheating',
      'max_temperature_c: 102',
      'production_delay_minutes: 18',
      'recurrence_count_7d: 2',
      'severity: high',
      'sla_hours: 2',
    ],
    outcomes: [
      'Workflow: Escalated to maintenance manager',
      'Auto-generated task checklist for root cause analysis',
      'Operations dashboard KPI adjusted in real time',
    ],
    reportPreview: 'Daily operations digest now highlights C-12 as risk item with action owner and ETA.',
  },
  compliance: {
    label: 'Compliance',
    title: 'Policy Breach Near-Miss Captured in Teams',
    context:
      'Compliance officer reports a vendor waste-disposal discrepancy. EnovAIt links evidence and starts approval/escalation chain.',
    conversation: [
      { role: 'user', text: 'Vendor manifest says 12 drums disposed, weighbridge slip shows 9. Need urgent validation.' },
      { role: 'assistant', text: 'Received. Please share manifest reference id and disposal date.' },
      { role: 'user', text: 'Manifest WF-8821, date 2026-03-18.' },
      { role: 'assistant', text: 'Logged as compliance discrepancy. Legal + plant admin notified and investigation workflow started.' },
    ],
    extracted: [
      'manifest_id: WF-8821',
      'date: 2026-03-18',
      'declared_disposal_drums: 12',
      'verified_disposal_drums: 9',
      'mismatch_count: 3',
      'risk_level: critical',
      'evidence_links: 2',
    ],
    outcomes: [
      'Workflow: Critical compliance review initiated',
      'Escalation to legal counsel and plant administration',
      'Audit trail locked with immutable event history',
    ],
    reportPreview: 'Compliance dashboard now shows open discrepancy with evidence bundle and owner timeline.',
  },
} as const;

export function LandingPage() {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const scenarioEntries = Object.entries(demoScenarios) as Array<
    [keyof typeof demoScenarios, (typeof demoScenarios)[keyof typeof demoScenarios]]
  >;

  return (
    <div className="min-h-screen bg-background selection:bg-primary/10">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
              E
            </div>
            <span className="font-bold text-xl tracking-tight">EnovAIt</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-primary transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative">
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] -z-10 rounded-full" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="mb-6 py-1 px-4 rounded-full border-primary/20 bg-primary/5 text-primary">
              Proactive ESG Intelligence for Indian Enterprises
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
              Catch ESG Leaks <br />
              <span className="text-primary">Before the Audit Finds Them</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              EnovAIt is the AI layer between your operations and your ESG reports. 
              Your teams log data by chatting on WhatsApp, Teams, or web. 
              Your reports write themselves. Your gaps surface in real time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="h-12 px-8 text-base gap-2">
                  Start spotting issues today
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="h-12 px-8 text-base gap-2"
                onClick={() => setIsDemoOpen(true)}
              >
                <Play className="w-4 h-4 fill-current" />
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Value Prop Section */}
      <section id="how-it-works" className="py-24 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4">The AI Layer</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Between Operations and Audit-Ready Reports</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Your operations generate massive data every day. Most sustainability teams spend weeks manually hunting for inconsistencies, missing metrics, or weak disclosures — only to discover them during audit.
              </p>
              <p className="text-lg font-medium mb-8">EnovAIt changes that.</p>
              <div className="space-y-4">
                {[
                  'Log data by chatting on WhatsApp or Teams',
                  'Automatically validates data against BRSR frameworks',
                  'Flags anomalies, gaps, and risks in real time',
                  'Generates compliant narratives and templates'
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="bg-destructive/5 border-destructive/10">
                <CardHeader>
                  <CardTitle className="text-destructive">Before EnovAIt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• Scattered data across systems</p>
                  <p>• Manual Excel checks</p>
                  <p>• Last-minute BRSR panic</p>
                  <p>• Leadership questioning numbers</p>
                </CardContent>
              </Card>
              <Card className="bg-green-500/5 border-green-500/10">
                <CardHeader>
                  <CardTitle className="text-green-500">With EnovAIt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• Conversational data capture</p>
                  <p>• Automated anomaly detection</p>
                  <p>• One-click report generation</p>
                  <p>• Confidence in disclosures</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Stop Finding ESG Leaks in the Audit. Find Them Now.</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stop asking your teams to fill forms they'll never fill. 
              EnovAIt turns fragmented operations data into confident decisions.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4">Pricing</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Less than one compliance consultant's day rate</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that's right for your organization. All plans include audit-ready BRSR templates.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map((plan) => (
              <Card key={plan.name} className={cn(
                "relative flex flex-col h-full",
                plan.popular ? "border-primary shadow-xl scale-105 z-10" : ""
              )}>
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.price !== 'Custom' && <span className="text-muted-foreground">/mo</span>}
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                    {plan.cta}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-primary rounded-3xl p-12 text-center text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 blur-[80px] rounded-full -ml-32 -mb-32" />
          
          <h2 className="text-3xl md:text-5xl font-bold mb-6 relative">Your next audit is closer than you think.</h2>
          <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto relative">
            Start your 14-day free trial — no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative">
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="h-12 px-8 text-base">
                Start spotting issues today
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base bg-transparent border-white/20 hover:bg-white/10 text-white"
              onClick={() => setIsDemoOpen(true)}
            >
              Book a 15-min demo
            </Button>
          </div>
        </div>
      </section>

      <Dialog open={isDemoOpen} onOpenChange={setIsDemoOpen}>
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              EnovAIt Contextual Demo
            </DialogTitle>
            <DialogDescription>
              See how natural conversation turns into structured records, workflows, and audit-ready outputs in minutes.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="esg" className="gap-4">
            <TabsList className="w-full justify-start">
              {scenarioEntries.map(([key, scenario]) => (
                <TabsTrigger key={key} value={key}>
                  {scenario.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {scenarioEntries.map(([key, scenario]) => (
              <TabsContent key={key} value={key} className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-5">
                  <Card className="lg:col-span-3">
                    <CardHeader>
                      <CardTitle className="text-base">{scenario.title}</CardTitle>
                      <CardDescription>{scenario.context}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {scenario.conversation.map((message, index) => (
                        <div
                          key={`${scenario.label}-message-${index}`}
                          className={cn(
                            'flex gap-3 rounded-lg border p-3',
                            message.role === 'assistant' ? 'bg-primary/5 border-primary/20' : 'bg-muted/30',
                          )}
                        >
                          <div className="mt-0.5">
                            {message.role === 'assistant' ? (
                              <Bot className="h-4 w-4 text-primary" />
                            ) : (
                              <User className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
                              {message.role === 'assistant' ? 'EnovAIt AI' : 'Operator'}
                            </p>
                            <p className="text-sm leading-relaxed">{message.text}</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <div className="lg:col-span-2 space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <BadgeCheck className="h-4 w-4 text-primary" />
                          Structured Extraction
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {scenario.extracted.map((field) => (
                          <div key={field} className="rounded-md bg-muted/40 px-2.5 py-1.5 text-xs font-mono">
                            {field}
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <BellRing className="h-4 w-4 text-primary" />
                          Automated Outcomes
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {scenario.outcomes.map((outcome) => (
                          <div key={outcome} className="flex gap-2">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                            <span>{outcome}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4 text-sm">
                    <p className="font-medium mb-1">Report Impact</p>
                    <p className="text-muted-foreground">{scenario.reportPreview}</p>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>

          <DialogFooter>
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-between">
              <Button variant="ghost" onClick={() => setIsDemoOpen(false)}>
                Close Demo
              </Button>
              <div className="flex gap-2">
                <Link to="/login">
                  <Button variant="outline">Try Login</Button>
                </Link>
                <Link to="/signup">
                  <Button>
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="py-12 px-6 border-t">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
          <div className="col-span-2 lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold text-sm">
                E
              </div>
              <span className="font-bold text-lg tracking-tight">EnovAIt</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              AI that turns ESG operations into audit-ready intelligence. 
              Proactive ESG Intelligence for Indian Enterprises.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <Twitter className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Github className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Changelog</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-bold text-sm">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t text-center text-xs text-muted-foreground">
          © 2026 EnovAIt Technologies Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
