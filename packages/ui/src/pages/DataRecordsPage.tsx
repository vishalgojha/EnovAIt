import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  RefreshCw,
  Download, 
  Eye, 
  MoreHorizontal,
  Tag,
  Upload,
  FileUp,
  Sparkles,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { adminApi, dataApi } from '@/lib/api/endpoints';
import { DataRecord } from '@/types';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BlockGuide } from '@/components/layout/BlockGuide';

export function DataRecordsPage() {
  const [search, setSearch] = React.useState('');
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<{
    status: 'idle' | 'uploading' | 'success' | 'error';
    message: string;
  }>({
    status: 'idle',
    message: 'Upload a PDF, spreadsheet, or text file to create a live evidence record.',
  });

  const {
    data: records = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['data-records'],
    queryFn: () => dataApi.getRecords(),
  });

  const { data: modules = [] } = useQuery({
    queryKey: ['admin-modules'],
    queryFn: adminApi.getModules,
  });

  const preferredModule = useMemo(
    () =>
      modules.find((module) => module.code === 'brsr_india') ||
      modules.find((module) => module.name.toLowerCase().includes('brsr')) ||
      modules[0],
    [modules]
  );

  useEffect(() => {
    if (!selectedModuleId && preferredModule) {
      setSelectedModuleId(preferredModule.id);
    }
  }, [preferredModule, selectedModuleId]);

  const filteredRecords = records.filter(r => 
    r.id.toLowerCase().includes(search.toLowerCase()) || 
    r.record_type.toLowerCase().includes(search.toLowerCase()) ||
    JSON.stringify(r.data).toLowerCase().includes(search.toLowerCase())
  );

  const uploadAccepted = '.pdf,.xlsx,.xls,.csv,.txt,.md';

  const uploadEvidence = async () => {
    if (!selectedModuleId) {
      setUploadState({
        status: 'error',
        message: 'Select a module before uploading evidence.',
      });
      return;
    }

    if (!selectedFile) {
      setUploadState({
        status: 'error',
        message: 'Choose a file to ingest first.',
      });
      return;
    }

    const extension = selectedFile.name.split('.').pop()?.toLowerCase() ?? '';
    const isSpreadsheet = ['xlsx', 'xls', 'csv'].includes(extension);

    setUploadState({
      status: 'uploading',
      message: `Ingesting ${selectedFile.name}...`,
    });

    try {
      const result = isSpreadsheet
        ? await dataApi.ingestExcel(selectedModuleId, selectedFile)
        : await dataApi.ingestDocument(selectedModuleId, selectedFile);

      setUploadState({
        status: 'success',
        message: `Ingested ${result.file_name} as ${result.kind}. Evidence record ${result.record_id.slice(0, 8)} is now live.`,
      });
      setSelectedFile(null);
      await refetch();
    } catch (error) {
      setUploadState({
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to ingest file. Please try again.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <BlockGuide
        eyebrow="Evidence intake"
        title="Bring live BRSR evidence into the workspace"
        description="Upload PDFs, spreadsheets, or text notes and EnovAIt will create a real evidence record, log the ingestion event, and connect it to the selected module."
        points={[
          { title: 'Pick the module', detail: 'Route uploads into the right reporting lane before they become evidence.' },
          { title: 'Upload the file', detail: 'Each file should create a live record that can be reviewed later.' },
          { title: 'Watch the status', detail: 'Use the result banner to confirm the ingestion actually landed.' },
        ]}
        ctaLabel="Go to readiness"
        onCtaClick={() => window.location.assign('/dashboard/readiness')}
      />

      <Card className="rounded-[1.8rem] border-white/70 bg-[linear-gradient(180deg,rgba(246,248,248,0.96),rgba(255,255,255,0.96))] shadow-none">
        <CardContent className="p-6 md:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-primary">
                <Upload className="h-3.5 w-3.5" />
                Real ingestion
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-balance">Bring in live BRSR evidence</h1>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                Upload PDFs, spreadsheets, or text notes and EnovAIt will create a real evidence record, log the ingestion event,
                and connect it to the selected module so the workspace stays audit-friendly.
              </p>
            </div>

            <div className="rounded-[1.5rem] bg-white px-4 py-4 shadow-sm lg:w-[360px]">
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Current mode</p>
              <div className="mt-2 flex items-center gap-2 text-sm font-medium">
                <Sparkles className="h-4 w-4 text-primary" />
                Ingestion-first demo
              </div>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                No dummy data. Every upload should turn into a live record and event.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-end">
            <div className="space-y-2">
              <Label htmlFor="module-select">Module</Label>
              <Select value={selectedModuleId} onValueChange={setSelectedModuleId}>
                <SelectTrigger id="module-select" className="w-full rounded-2xl bg-white">
                  <SelectValue placeholder="Select a module" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module.id} value={module.id}>
                      {module.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="evidence-file">Evidence file</Label>
              <Input
                id="evidence-file"
                type="file"
                accept={uploadAccepted}
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                className="rounded-2xl bg-white"
              />
            </div>

            <Button
              className="rounded-2xl px-6"
              onClick={uploadEvidence}
              disabled={!selectedFile || !selectedModuleId || uploadState.status === 'uploading'}
            >
              <FileUp className="mr-2 h-4 w-4" />
              {uploadState.status === 'uploading' ? 'Ingesting...' : 'Ingest evidence'}
            </Button>
          </div>

          <div
            className={cn(
              'mt-4 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm',
              uploadState.status === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-900',
              uploadState.status === 'error' && 'border-rose-200 bg-rose-50 text-rose-900',
              uploadState.status === 'uploading' && 'border-blue-200 bg-blue-50 text-blue-900',
              uploadState.status === 'idle' && 'border-border bg-muted/30 text-muted-foreground'
            )}
          >
            {uploadState.status === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : uploadState.status === 'error' ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            <span>{uploadState.message}</span>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Records</h1>
          <p className="text-muted-foreground">Browse and audit all data processed by your modules.</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search records..."
                  className="pl-9 h-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="h-9" onClick={() => refetch()} disabled={isFetching}>
                <RefreshCw className={cn('mr-2 h-4 w-4', isFetching && 'animate-spin')} />
                Refresh
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Showing {filteredRecords.length} of {records.length} records
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-sm text-muted-foreground">Loading records...</div>
          ) : isError ? (
            <div className="p-8 space-y-2">
              <p className="text-sm text-destructive">Failed to load data records.</p>
              <p className="text-xs text-muted-foreground">
                {error instanceof Error ? error.message : 'Please retry.'}
              </p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-8 text-sm text-muted-foreground">No records found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Record ID</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Payload Preview</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono text-xs font-medium">{record.id}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        {record.module_id} / {record.record_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <div className="truncate text-xs text-muted-foreground font-mono">
                        {JSON.stringify(record.data)}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(record.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Tag className="mr-2 h-4 w-4" />
                            Add Tag
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
