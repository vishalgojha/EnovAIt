import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  ArrowRight, 
  BarChart3, 
  Shield, 
  Globe, 
  Zap, 
  ChevronRight,
  Database,
  Workflow
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-ivory font-sans">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-md bg-white/50 sticky top-0 z-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-[#4A6741] rounded flex items-center justify-center text-white font-bold text-sm">E</div>
          <span className="text-lg font-semibold tracking-tight uppercase text-gray-900 font-sans">EnovAIt</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-gray-500">
          <a href="#features" className="hover:text-[#4A6741] transition-colors">Features</a>
          <a href="#solutions" className="hover:text-[#4A6741] transition-colors">Solutions</a>
          <a href="#company" className="hover:text-[#4A6741] transition-colors">Company</a>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild className="text-sm font-semibold text-gray-600">
            <Link to="/dashboard">Log in</Link>
          </Button>
          <Button className="bg-[#1A1A1A] text-white hover:bg-black text-xs font-bold uppercase tracking-widest px-6 h-10 shadow-sm border-none">Get Started</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-6 md:px-12 overflow-hidden bg-brand-ivory">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#4A6741]/10 text-[#4A6741] text-[10px] font-bold uppercase tracking-widest border border-[#4A6741]/20">
              <Zap className="h-3 w-3" />
              India's Premier ESG Workspace
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] text-gray-900 tracking-tight">
              Professional <br/>
              <span className="text-[#4A6741]">ESG Intelligence.</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-lg leading-relaxed font-medium">
              A comprehensive enterprise operating model for ESG compliance, BRSR disclosures, and sustainable value creation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="h-12 px-8 bg-[#4A6741] text-white hover:bg-[#3d5536] text-xs font-bold uppercase tracking-widest rounded shadow-md" asChild>
                <Link to="/dashboard" className="flex items-center gap-2">
                  Launch Workspace <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 border-gray-200 hover:bg-gray-50 text-xs font-bold uppercase tracking-widest rounded shadow-sm bg-white">
                Request Console Access
              </Button>
            </div>
            
            <div className="flex items-center gap-10 pt-10 opacity-30 grayscale filter">
              <div className="font-bold text-lg uppercase tracking-tighter">Enterprise</div>
              <div className="font-bold text-lg uppercase tracking-tighter">Governance</div>
              <div className="font-bold text-lg uppercase tracking-tighter">disclosure</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 bg-white rounded-2xl p-6 shadow-2xl border border-gray-100">
               <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                  <div className="px-3 py-1 bg-gray-50 rounded text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    Live Session: Workspace_04
                  </div>
               </div>
               
               <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#4A6741]/5 p-5 rounded-xl border border-[#4A6741]/10 flex flex-col gap-2">
                       <BarChart3 className="h-6 w-6 text-[#4A6741]" />
                       <div className="h-2 w-12 bg-[#4A6741]/20 rounded mt-2" />
                       <div className="h-1 w-20 bg-[#4A6741]/10 rounded" />
                    </div>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 flex flex-col gap-2">
                       <Shield className="h-6 w-6 text-gray-400" />
                       <div className="h-2 w-16 bg-gray-200 rounded mt-2" />
                       <div className="h-1 w-12 bg-gray-100 rounded" />
                    </div>
                  </div>
                  <div className="h-32 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center">
                    <div className="text-center group overflow-hidden">
                       <Workflow className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                       <div className="h-1 w-24 bg-gray-100 rounded" />
                    </div>
                  </div>
               </div>
            </div>
            {/* Background elements */}
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#4A6741]/5 blur-[80px] rounded-full" />
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-gray-900/5 blur-[80px] rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Authority in Disclosure</h2>
            <p className="text-gray-500 text-lg leading-relaxed font-normal">
              Empowering large-scale enterprises with an integrated AI operating model for ESG/BRSR excellence.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: Shield, title: "Automated Compliance", desc: "Native support for SEBI BRSR Core and global ESG frameworks with automated gap detection." },
              { icon: Database, title: "Enterprise Data Fabric", desc: "Centralize disjointed data streams through secure, managed integrations and API layers." },
              { icon: Workflow, title: "Authoritative Pipelines", desc: "Enforce rigorous verification workflows with immutable audit trails for every disclosure." },
              { icon: Globe, title: "Regional Relevance", desc: "Deep localization for the Indian regulatory landscape with global standard parity." },
              { icon: Zap, title: "Fine-Tuned Models", desc: "Specialized ESG intelligence models capable of analyzing complex sustainability datasets." },
              { icon: ChevronRight, title: "Platform Console", desc: "Complete administrative control over secrets, environment variables, and platform health." },
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-2xl border border-gray-100 hover:border-[#4A6741]/30 hover:bg-[#4A6741]/5 transition-all space-y-5 shadow-sm hover:shadow-none">
                <div className="h-10 w-10 bg-gray-50 rounded flex items-center justify-center text-gray-400 group-hover:bg-[#4A6741] group-hover:text-white transition-all">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{feature.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed font-normal">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 px-6 md:px-12 border-t border-gray-200 bg-brand-ivory">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-[#1A1A1A] rounded flex items-center justify-center text-white font-bold text-sm">E</div>
            <span className="text-lg font-semibold tracking-tight uppercase">EnovAIt</span>
          </div>
          <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400">
            © 2026 Enov360 Intelligence. Professional Polish Edition.
          </div>
          <div className="flex gap-8 text-[10px] uppercase font-bold tracking-widest text-gray-500">
            <a href="#" className="hover:text-[#4A6741] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#4A6741] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#4A6741] transition-colors">Console</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
