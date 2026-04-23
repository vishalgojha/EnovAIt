import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  BarChart3,
  Globe2,
  FileText
} from "lucide-react";

const frameworks = [
  { name: "SEBI BRSR Core", progress: 92, status: "Ready", type: "Mandatory" },
  { name: "GRI Standards", progress: 65, status: "In Progress", type: "Voluntary" },
  { name: "TCFD Disclosures", progress: 40, status: "Action Needed", type: "Voluntary" },
  { name: "SASB Sector Specific", progress: 10, status: "Not Started", type: "Voluntary" },
];

export default function Readiness() {
  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Compliance Readiness</h1>
          <p className="text-xs text-gray-500 italic mt-1">Evaluate your organization's preparation for local and global reporting standards.</p>
        </div>
        <p className="text-[10px] uppercase font-bold tracking-widest text-[#4A6741]">Draft v4.2</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Aggregate Readiness</p>
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-gray-900">76%</div>
            <div className="px-1.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded">+4.2%</div>
          </div>
          <Progress value={76} className="h-1.5 mt-4" />
        </Card>

        <Card className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Critical Gaps</p>
          <div className="text-3xl font-bold text-gray-900">08</div>
          <div className="flex gap-1.5 mt-4">
            <Badge className="bg-red-50 text-red-700 border-red-100 text-[9px] font-bold uppercase tracking-widest px-2">Energy</Badge>
            <Badge className="bg-red-50 text-red-700 border-red-100 text-[9px] font-bold uppercase tracking-widest px-2">Emissions</Badge>
          </div>
        </Card>

        <Card className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Verified Metrics</p>
          <div className="text-3xl font-bold text-gray-900">142</div>
          <div className="flex -space-x-1.5 mt-4 overflow-hidden">
             {[1,2,3,4,5].map(i => (
               <div key={i} className="inline-block h-6 w-6 rounded-full border border-white bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-500 uppercase">
                 B{i}
               </div>
             ))}
          </div>
        </Card>
      </div>

      <Card className="bg-white overflow-hidden border-gray-200 shadow-sm flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Framework Comparison</h3>
          <button className="text-xs text-[#4A6741] font-medium">Export CSV</button>
        </div>
        <CardContent className="p-6">
          <div className="space-y-8">
            {frameworks.map((f) => (
              <div key={f.name} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded bg-[#4A6741]/5 border border-[#4A6741]/10 flex items-center justify-center text-[#4A6741]">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{f.name}</p>
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mt-0.5">{f.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-900">{f.progress}%</p>
                    <span className={cn(
                      "text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded mt-1 inline-block",
                      f.progress > 80 ? "bg-green-50 text-green-700" : f.progress > 40 ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-400"
                    )}>
                      {f.status}
                    </span>
                  </div>
                </div>
                <Progress value={f.progress} className="h-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 font-bold text-sm text-gray-900">Geographical Dispersion</div>
          <CardContent className="h-48 flex items-center justify-center bg-gray-50/50 m-6 mt-6 rounded-lg border border-dashed border-gray-200">
             <div className="text-center space-y-2">
                <Globe2 className="h-6 w-6 mx-auto text-gray-300" />
                <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Regional Mapping Active</p>
             </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#1A1A1A] text-white p-8 flex flex-col items-center justify-center text-center space-y-4 border-none">
          <div className="h-10 w-10 rounded-full bg-[#4A6741]/20 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-[#4A6741]" />
          </div>
          <h3 className="text-lg font-bold">Audit-Ready Snapshot</h3>
          <p className="text-gray-400 text-[11px] leading-relaxed max-w-xs mx-auto">
            Generate an immutable readiness profile for board reporting or external assurance partners.
          </p>
          <Button className="bg-[#4A6741] text-white text-[10px] uppercase font-bold tracking-widest px-6 h-9 hover:bg-[#4A6741]/90">
            Generate Intelligence Report
          </Button>
        </Card>
      </div>
    </div>
  );
}
