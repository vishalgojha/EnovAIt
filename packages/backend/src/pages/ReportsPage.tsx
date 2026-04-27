import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileBarChart, FilePieChart, FileSearch, FileText, RefreshCw, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { reportApi } from '@/lib/api/endpoints';
import type { Report } from '@/types';

const reportTypeIcons: Record<string, typeof FileText> = {
  esg_summary: FilePieChart,
  operations_dashboard: FileBarChart,
  compliance_checklist: FileSearch,
  brsr_annual_report: FileText,
  custom: FileText,
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

export function ReportsPage() {
  const [search, setSearch] = React.useState('');

  const reportsQuery = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportApi.getReports({ limit: 50 }),
    initialData: [] as Report[],
  });

  const reports = reportsQuery.data ?? [];

  const filteredReports = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return reports;
    }

    return reports.filter((report) =>
      [report.title, report.report_type, report.status].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [reports, search]);

  const readyCount = reports.filter((report) => report.status === 'generated').length;
  const reportTypes = new Set(reports.map((report) => report.report_type)).size;
  const latestReport = reports[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            Open shared summaries and prepared updates without digging through raw records.
          </p>
        </div>
        <Button variant="outline" onClick={() => void reportsQuery.refetch()}>
          <RefreshCw className={`mr-2 h-4 w-4 ${reportsQuery.isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total reports</CardDescription>
            <CardTitle className="text-3xl">{reports.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">All saved reports visible to you right now.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ready to share</CardDescription>
            <CardTitle className="text-3xl">{readyCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Reports already generated and available in the list.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Report types</CardDescription>
            <CardTitle className="text-3xl">{reportTypes}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {latestReport ? `Latest report: ${formatDate(latestReport.generated_at)}` : 'No reports have been created yet.'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Saved reports</CardTitle>
              <CardDescription>Search by report name, type, or current status.</CardDescription>
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search reports"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
          {reportsQuery.isError ? (
            <p className="text-sm text-destructive">
              We could not load the latest reports right now. You can refresh and try again.
            </p>
          ) : null}
        </CardHeader>
        <CardContent>
          {filteredReports.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredReports.map((report) => {
                const Icon = reportTypeIcons[report.report_type] || FileText;

                return (
                  <Card key={report.id} className="border bg-background shadow-none">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-base">{report.title}</CardTitle>
                          <CardDescription className="capitalize">
                            {report.report_type.replace(/_/g, ' ')}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={report.status === 'generated' ? 'outline' : 'secondary'}>
                          {report.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Created</span>
                        <span>{formatDate(report.generated_at)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Reference</span>
                        <span className="text-xs text-muted-foreground">{report.id}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              {reportsQuery.isFetching ? 'Loading reports...' : 'No reports to show yet.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
