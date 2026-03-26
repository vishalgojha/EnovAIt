import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Shield, 
  Layers, 
  Cpu, 
  Globe, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle2,
  Play,
  Github,
  Twitter,
  Linkedin,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

export function LandingPage() {
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
            <Link to="/login">
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
              <Link to="/login">
                <Button size="lg" className="h-12 px-8 text-base gap-2">
                  Start spotting issues today
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="h-12 px-8 text-base gap-2">
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
            <Link to="/login">
              <Button size="lg" variant="secondary" className="h-12 px-8 text-base">
                Start spotting issues today
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-transparent border-white/20 hover:bg-white/10 text-white">
              Book a 15-min demo
            </Button>
          </div>
        </div>
      </section>

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


