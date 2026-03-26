import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  FileText, 
  Download, 
  MoreVertical,
  BarChart3,
  Calendar,
  Clock,
  CheckCircle2,
  RefreshCw,
  FilePieChart,
  FileBarChart,
  FileSearch
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { reportApi } from '@/lib/api/endpoints';
import { Report } from '@/types';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

const reportTypeIcons: Record<string, any> = {
  esg_summary: FilePieChart,
  operations_dashboard: FileBarChart,
  compliance_checklist: FileSearch,
  custom: FileText,
};

export function ReportsPage() {
  const [search, setSearch] = React.useState('');

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: reportApi.getReports,
    initialData: [
      { id: 'REP-001', title: 'Monthly ESG Summary', report_type: 'esg_summary', status: 'generated', generated_at: '2024-03-01T00:00:00Z' },
      { id: 'REP-002', title: 'Operations Dashboard Snapshot', report_type: 'operations_dashboard', status: 'generated', generated_at: '2024-03-15T10:00:00Z' },
      { id: 'REP-003', title: 'Compliance Checklist', report_type: 'compliance_checklist', status: 'generated', generated_at: '2024-03-26T11:00:00Z' },
    ] as Report[],
  });

  const filteredReports = reports?.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    r.report_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">Generate and manage data visualizations and audit reports.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-primary text-primary-foreground">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium opacity-80">Total Reports</CardTitle>
            <div className="text-3xl font-bold">128</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs opacity-70">+12 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ready to Download</CardTitle>
            <div className="text-3xl font-bold">115</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">90% of all generated</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled</CardTitle>
            <div className="text-3xl font-bold">8</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Automated weekly/monthly</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredReports?.map((report) => {
          const Icon = reportTypeIcons[report.report_type] || FileText;
          return (
            <Card key={report.id} className="group overflow-hidden">
              <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold">{report.title}</CardTitle>
                    <CardDescription className="text-[10px] uppercase font-bold tracking-wider">{report.report_type}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      Download Excel
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={report.status === 'generated' ? 'outline' : 'secondary'} className="h-5 text-[10px]">
                    {report.status !== 'generated' && <RefreshCw className="mr-1 h-2 w-2 animate-spin" />}
                    {report.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">{new Date(report.generated_at).toLocaleDateString()}</span>
                </div>
              </CardContent>
              <CardFooter className="p-0 border-t">
                <Button variant="ghost" className="w-full rounded-none h-10 text-xs gap-2" disabled={report.status !== 'generated'}>
                  <Download className="h-3 w-3" />
                  Download Report
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
