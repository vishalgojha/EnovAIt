import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  Users, 
  Activity, 
  CheckCircle2, 
  Clock,
  AlertTriangle
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const areaData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
];

const barData = [
  { name: 'Mon', count: 40 },
  { name: 'Tue', count: 30 },
  { name: 'Wed', count: 60 },
  { name: 'Thu', count: 45 },
  { name: 'Fri', count: 70 },
];

export default function Dashboard() {
  return (
    <div className="flex-1 p-0 overflow-hidden space-y-8">
      <div className="flex items-end justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Compliance Dashboard</h1>
        <p className="text-xs text-gray-500">Last data sync: 12 minutes ago</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "BRSR Readiness", value: "84.2%", change: "+2.4%", trend: "up", progress: 84.2 },
          { title: "Carbon Footprint (MT)", value: "1,240", change: "+0.8%", trend: "down", progress: 65, color: "bg-red-400" },
          { title: "Pending Reviews", value: "12", change: "4 Priority", trend: "neutral", dots: [true, true, false, false] },
          { title: "Integrations", value: "08", status: "Healthy", trend: "up" },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{stat.title}</p>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-bold">{stat.value}</span>
                {stat.change && (
                  <span className={cn(
                    "text-[10px] font-medium mb-1",
                    stat.trend === "up" ? "text-green-600" : stat.trend === "down" ? "text-red-600" : "text-gray-400"
                  )}>
                    {stat.change}
                  </span>
                )}
                {stat.status && (
                  <span className="text-[10px] text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded">
                    {stat.status}
                  </span>
                )}
              </div>
              
              {stat.progress !== undefined && (
                <div className="mt-4 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-500", stat.color || "bg-[#4A6741]")} 
                    style={{ width: `${stat.progress}%` }} 
                  />
                </div>
              )}
              
              {stat.dots && (
                <div className="mt-4 flex gap-1">
                  {stat.dots.map((active, idx) => (
                    <div 
                      key={idx} 
                      className={cn("h-1.5 flex-1 rounded-full", active ? "bg-red-400" : "bg-gray-100")} 
                    />
                  ))}
                </div>
              )}

              {stat.title === "Integrations" && (
                <div className="flex gap-1 mt-4">
                  {[1, 2, 3, 4].map(idx => (
                    <div key={idx} className="w-5 h-5 bg-gray-100 rounded-sm" />
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart area (using actual chart component) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900">Compliance Velocity</h3>
            <button className="text-xs text-[#4A6741] font-medium hover:underline">Download Report</button>
          </div>
          <div className="p-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A6741" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4A6741" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#4A6741" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Modules Sidebar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-bold mb-6 text-gray-900">Active Modules</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Emissions', initials: 'E' },
              { label: 'Governance', initials: 'G' },
              { label: 'Social', initials: 'S' },
              { label: 'Review', initials: 'R' },
            ].map(module => (
              <div 
                key={module.label}
                className="p-4 rounded-lg bg-[#4A6741]/5 border border-[#4A6741]/10 flex flex-col items-center gap-2 group cursor-pointer hover:border-[#4A6741]/40 transition-colors"
              >
                <div className="w-10 h-10 rounded bg-[#4A6741] text-white flex items-center justify-center font-bold text-lg">
                  {module.initials}
                </div>
                <span className="text-[11px] font-semibold uppercase text-gray-900">{module.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Reporting Milestone</span>
              <span className="text-[10px] font-bold text-[#4A6741]">70%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#4A6741] to-[#6d8a63] w-[70%]"></div>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 italic">Phase 2 Data Verification ends in 4 days.</p>
          </div>
        </div>
      </div>

      {/* Review Queue Table */}
      <Card className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Recent Filings / Review Queue</h3>
          <button className="text-xs text-[#4A6741] font-medium hover:underline">View all</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50/50 text-[10px] uppercase text-gray-500 font-bold">
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3">Entity / Disclosure</th>
                <th className="px-6 py-3">Assigned To</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Due Date</th>
              </tr>
            </thead>
            <tbody className="text-xs text-gray-700">
              {[
                { title: "Tata Power - Scope 1 Emissions", user: "Arjun Singh", status: "Pending", statusColor: "bg-yellow-50 text-yellow-700 border-yellow-100", due: "Oct 12" },
                { title: "Reliance Ind - Human Rights Policy", user: "Preeti Verma", status: "In Review", statusColor: "bg-blue-50 text-blue-700 border-blue-100", due: "Oct 15" },
                { title: "Infosys Ltd - Training Data", user: "M. Deshmukh", status: "Completed", statusColor: "bg-green-50 text-green-700 border-green-100", due: "Oct 08" },
                { title: "Adani Ports - Waste Management", user: "Arjun Singh", status: "Flagged", statusColor: "bg-red-50 text-red-700 border-red-100", due: "Oct 05" },
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{row.title}</td>
                  <td className="px-6 py-4">{row.user}</td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2 py-0.5 rounded-full border text-[10px] font-medium", row.statusColor)}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">{row.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
