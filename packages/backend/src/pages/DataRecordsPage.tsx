import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { RefreshCw, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { dataApi } from '@/lib/api/endpoints';
import type { DataRecord } from '@/types';

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

export function DataRecordsPage() {
  const [search, setSearch] = React.useState('');

  const recordsQuery = useQuery({
    queryKey: ['data-records'],
    queryFn: () => dataApi.getRecords({ limit: 50 }),
    initialData: [] as DataRecord[],
  });

  const records = recordsQuery.data ?? [];

  const filteredRecords = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return records;
    }

    return records.filter((record) =>
      [
        record.id,
        record.title || '',
        record.record_type,
        record.status,
        JSON.stringify(record.data || {}),
      ].some((value) => value.toLowerCase().includes(query))
    );
  }, [records, search]);

  const finalCount = records.filter((record) => record.status === 'final').length;
  const draftCount = records.filter((record) => record.status === 'draft').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Records</h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            Find saved forms, uploads, and structured updates from across the workspace.
          </p>
        </div>
        <Button variant="outline" onClick={() => void recordsQuery.refetch()}>
          <RefreshCw className={`mr-2 h-4 w-4 ${recordsQuery.isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total records</CardDescription>
            <CardTitle className="text-3xl">{records.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Everything currently saved in this workspace view.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ready records</CardDescription>
            <CardTitle className="text-3xl">{finalCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Records marked complete and ready to use.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Still in progress</CardDescription>
            <CardTitle className="text-3xl">{draftCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Records that may still need updates or review.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Saved records</CardTitle>
              <CardDescription>Search by record name, type, or saved details.</CardDescription>
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search records"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
          {recordsQuery.isError ? (
            <p className="text-sm text-destructive">
              We could not load the latest records right now. You can refresh and try again.
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[160px]">Record</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Saved</TableHead>
                <TableHead>Preview</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length > 0 ? (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{record.title || record.id}</p>
                        <p className="text-xs text-muted-foreground">{record.id}</p>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">
                      {record.record_type.replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={record.status === 'final' ? 'outline' : 'secondary'}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(record.updated_at || record.created_at)}
                    </TableCell>
                    <TableCell className="max-w-[360px] truncate text-sm text-muted-foreground">
                      {Object.entries(record.data || {})
                        .slice(0, 2)
                        .map(([key, value]) => `${key}: ${String(value)}`)
                        .join(' | ') || 'No extra details saved yet'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-28 text-center text-sm text-muted-foreground">
                    {recordsQuery.isFetching ? 'Loading records...' : 'No records to show yet.'}
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
