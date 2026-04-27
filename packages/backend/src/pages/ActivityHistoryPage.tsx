import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock3, FileText, RefreshCw, Search, Shapes } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { dataApi, reportApi } from '@/lib/api/endpoints';
import type { DataRecord, Report } from '@/types';

type ActivityItem = {
  id: string;
  when: string;
  title: string;
  source: string;
  status: string;
  summary: string;
  kind: 'record' | 'report';
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function buildActivities(records: DataRecord[], reports: Report[]): ActivityItem[] {
  const recordItems = records.map((record) => ({
    id: `record-${record.id}`,
    when: record.updated_at || record.created_at,
    title: record.title || record.id,
    source: record.record_type.replace(/_/g, ' '),
    status: record.status,
    summary: Object.entries(record.data || {})
      .slice(0, 2)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(' | '),
    kind: 'record' as const,
  }));

  const reportItems = reports.map((report) => ({
    id: `report-${report.id}`,
    when: report.generated_at,
    title: report.title,
    source: report.report_type.replace(/_/g, ' '),
    status: report.status,
    summary: 'Shared update prepared for review.',
    kind: 'report' as const,
  }));

  return [...recordItems, ...reportItems]
    .sort((left, right) => new Date(right.when).getTime() - new Date(left.when).getTime())
    .slice(0, 20);
}

export function ActivityHistoryPage() {
  const [search, setSearch] = React.useState('');

  const recordsQuery = useQuery({
    queryKey: ['activity-history', 'records'],
    queryFn: () => dataApi.getRecords({ limit: 20 }),
    initialData: [] as DataRecord[],
  });

  const reportsQuery = useQuery({
    queryKey: ['activity-history', 'reports'],
    queryFn: () => reportApi.getReports({ limit: 20 }),
    initialData: [] as Report[],
  });

  const records = recordsQuery.data ?? [];
  const reports = reportsQuery.data ?? [];

  const activities = React.useMemo(
    () => buildActivities(records, reports),
    [records, reports]
  );

  const filteredActivities = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return activities;
    }

    return activities.filter((item) =>
      [item.title, item.source, item.status, item.summary].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [activities, search]);

  const isRefreshing = recordsQuery.isFetching || reportsQuery.isFetching;
  const hasError = recordsQuery.isError || reportsQuery.isError;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Activity History</h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            See the latest records and reports in one place so it is easy to follow what changed
            across the workspace.
          </p>
        </div>
        <Button variant="outline" onClick={() => { void recordsQuery.refetch(); void reportsQuery.refetch(); }}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Recent updates</CardDescription>
            <CardTitle className="text-3xl">{activities.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Latest record and report changes combined.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Records</CardDescription>
            <CardTitle className="text-3xl">{records.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Saved forms, files, and structured updates.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Reports</CardDescription>
            <CardTitle className="text-3xl">{reports.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Ready-made summaries prepared in the workspace.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Recent workspace activity</CardTitle>
              <CardDescription>Search through the latest updates from records and reports.</CardDescription>
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search recent activity"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
          {hasError ? (
            <p className="text-sm text-destructive">
              Some recent activity could not be loaded right now. You can still refresh and try again.
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">When</TableHead>
                <TableHead>What changed</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivities.length > 0 ? (
                filteredActivities.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-sm text-muted-foreground">{formatDateTime(item.when)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.kind === 'record' ? (
                          <Shapes className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium">{item.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">{item.source}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'generated' || item.status === 'final' ? 'outline' : 'secondary'}>
                        {item.status.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[360px] truncate text-sm text-muted-foreground">
                      {item.summary || 'Shared workspace update'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-28 text-center text-sm text-muted-foreground">
                    {isRefreshing ? (
                      <span className="inline-flex items-center gap-2">
                        <Clock3 className="h-4 w-4 animate-pulse" />
                        Loading recent activity
                      </span>
                    ) : (
                      'No recent activity to show yet.'
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
