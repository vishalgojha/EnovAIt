import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Clock3, RefreshCw, Search, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { workflowApi } from '@/lib/api/endpoints';
import type { WorkflowInstance } from '@/types';

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

export function WorkflowsPage() {
  const [search, setSearch] = React.useState('');

  const workflowQuery = useQuery({
    queryKey: ['workflow-instances'],
    queryFn: () => workflowApi.getInstances({ limit: 50 }),
    initialData: [] as WorkflowInstance[],
  });

  const instances = workflowQuery.data ?? [];

  const filteredInstances = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return instances;
    }

    return instances.filter((instance) =>
      [instance.id, instance.rule_id || '', instance.current_step || '', instance.state].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [instances, search]);

  const runningCount = instances.filter((instance) => instance.state === 'pending').length;
  const completedCount = instances.filter((instance) =>
    ['completed', 'approved'].includes(instance.state)
  ).length;
  const attentionCount = instances.filter((instance) =>
    ['rejected', 'escalated'].includes(instance.state)
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Steps & Follow-ups</h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            Follow the progress of review steps and see which requests still need attention.
          </p>
        </div>
        <Button variant="outline" onClick={() => void workflowQuery.refetch()}>
          <RefreshCw className={`mr-2 h-4 w-4 ${workflowQuery.isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-full bg-muted p-2 text-muted-foreground">
              <Clock3 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In progress</p>
              <p className="text-2xl font-bold">{runningCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-full bg-muted p-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Finished</p>
              <p className="text-2xl font-bold">{completedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-full bg-muted p-2 text-destructive">
              <XCircle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Need attention</p>
              <p className="text-2xl font-bold">{attentionCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Current follow-ups</CardTitle>
              <CardDescription>Search by request number, current step, or rule name.</CardDescription>
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search follow-ups"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
          {workflowQuery.isError ? (
            <p className="text-sm text-destructive">
              We could not load the latest follow-ups right now. You can refresh and try again.
            </p>
          ) : null}
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Request</TableHead>
                <TableHead>Current step</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Last change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstances.length > 0 ? (
                filteredInstances.map((instance) => (
                  <TableRow key={instance.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{instance.id}</p>
                        <p className="text-xs text-muted-foreground">{instance.rule_id || 'No linked rule yet'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">
                      {(instance.current_step || 'Waiting for the next step').replace(/_/g, ' ')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          instance.state === 'completed' || instance.state === 'approved'
                            ? 'outline'
                            : instance.state === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {instance.state.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(instance.created_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(instance.last_transition_at)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-28 text-center text-sm text-muted-foreground">
                    {workflowQuery.isFetching ? 'Loading follow-ups...' : 'No follow-ups to show yet.'}
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
