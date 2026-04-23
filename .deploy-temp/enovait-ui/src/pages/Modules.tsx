import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  ShieldCheck, 
  Users2, 
  Leaf, 
  Scale, 
  Cpu, 
  ExternalLink,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";

const modules = [
  {
    id: "brsr",
    title: "BRSR Core",
    desc: "SEBI mandated Business Responsibility and Sustainability Reporting.",
    icon: BarChart3,
    category: "Compliance",
    status: "Active",
    color: "bg-emerald-500",
  },
  {
    id: "esg-ratings",
    title: "ESG Workbench",
    desc: "Manage data points for top rating providers like MSCI, Sustainalytics.",
    icon: ShieldCheck,
    category: "Strategic",
    status: "Active",
    color: "bg-blue-500",
  },
  {
    id: "emissions",
    title: "Carbon Accounting",
    desc: "Scope 1, 2, and 3 emissions tracking and optimization.",
    icon: Leaf,
    category: "Environment",
    status: "Active",
    color: "bg-green-600",
  },
  {
    id: "supply-chain",
    title: "Value Chain ESG",
    desc: "Vendor assessment and supply chain sustainability auditing.",
    icon: Cpu,
    category: "Operational",
    status: "Active",
    color: "bg-indigo-500",
  },
  {
    id: "governance",
    title: "Corporate Governance",
    desc: "Board structure, ethical conduct, and policy management.",
    icon: Scale,
    category: "Compliance",
    status: "Setup Required",
    color: "bg-amber-500",
  },
  {
    id: "dei",
    title: "Diversity & Inclusion",
    desc: "Workforce demographics and social performance metrics.",
    icon: Users2,
    category: "Social",
    status: "Active",
    color: "bg-violet-500",
  },
];

export default function Modules() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Solution Modules</h1>
          <p className="text-xs text-gray-500 italic mt-1">Enterprise-grade ESG components active in your workspace.</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Filter modules..." className="pl-9 h-9 border-gray-200 text-xs shadow-sm bg-white" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <Card key={module.id} className="group overflow-hidden border-gray-200 shadow-sm transition-all hover:bg-gray-50 flex flex-col">
            <CardHeader className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded bg-[#4A6741] text-white flex items-center justify-center font-bold text-xl ring-4 ring-[#4A6741]/5">
                  {module.title.charAt(0)}
                </div>
                <Badge variant={module.id === 'governance' ? "outline" : "secondary"} className={cn(
                  "text-[10px] uppercase font-bold tracking-widest",
                  module.id !== 'governance' && "bg-green-50 text-green-700 border-green-100"
                )}>
                  {module.status}
                </Badge>
              </div>
              <CardTitle className="text-lg font-bold text-gray-900">{module.title}</CardTitle>
              <CardDescription className="text-xs text-gray-500 leading-relaxed mt-2">{module.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-100 font-bold text-[9px] uppercase tracking-widest">
                  {module.category}
                </Badge>
              </div>
            </CardContent>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <Button variant="ghost" size="sm" className="w-full text-xs font-semibold text-[#4A6741] transition-colors group-hover:bg-white">
                Launch Module
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 border border-gray-100">
          <Cpu className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="mt-4 text-sm font-bold text-gray-900">Custom Infrastructure Builder</h3>
        <p className="text-xs text-gray-400 mt-2 max-w-sm mx-auto italic">
          Coming Soon: Model your own disclosure frameworks with automated extraction and review.
        </p>
      </div>
    </div>
  );
}
