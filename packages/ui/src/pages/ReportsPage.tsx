import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  FileText, 
  Download, 
  RefreshCw,
  MoreVertical,
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

const reportTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  esg_summary: FilePieChart,
  operations_dashboard: FileBarChart,
  compliance_checklist: FileSearch,
  custom: FileText,
};

export function ReportsPage() {
  const [search, setSearch] = React.useState('');

  const {
    data: reports = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['reports'],
    queryFn: reportApi.getReports,
  });

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    r.report_type.toLowerCase().includes(search.toLowerCase())
  );

  const generatedCount = reports.filter((report) => report.status === 'generated').length;
  const inProgressCount = reports.filter((report) => report.status !== 'generated').length;

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
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reports</CardTitle>
            <div className="text-3xl font-bold">{reports.length}</div>
          </CardHeader>
          <CardContent />
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ready to Download</CardTitle>
            <div className="text-3xl font-bold">{generatedCount}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {reports.length > 0 ? `${Math.round((generatedCount / reports.length) * 100)}% of all reports` : 'No reports yet'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
            <div className="text-3xl font-bold">{inProgressCount}</div>
          </CardHeader>
          <CardContent />
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
        <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">Loading reports...</CardContent>
        </Card>
      ) : isError ? (
        <Card>
          <CardContent className="p-8 space-y-2">
            <p className="text-sm text-destructive">Failed to load reports.</p>
            <p className="text-xs text-muted-foreground">
              {error instanceof Error ? error.message : 'Please retry.'}
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : filteredReports.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">No reports found.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredReports.map((report) => {
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
      )}
    </div>
  );
}
