import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  RefreshCw,
  Play, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MoreHorizontal,
  ChevronRight,
  History,
  ArrowRight
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { workflowApi } from '@/lib/api/endpoints';
import { WorkflowInstance } from '@/types';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

export function WorkflowsPage() {
  const [search, setSearch] = React.useState('');

  const {
    data: instances = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['workflow-instances'],
    queryFn: () => workflowApi.getInstances(),
  });

  const filteredInstances = instances.filter(i => 
    i.id.toLowerCase().includes(search.toLowerCase()) || 
    (i.rule_id ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    {
      label: 'Running',
      value: instances.filter((instance) => instance.state === 'pending' || instance.state === 'escalated').length.toString(),
      icon: Play,
      color: 'text-blue-500',
    },
    {
      label: 'Completed',
      value: instances.filter((instance) => instance.state === 'completed' || instance.state === 'approved').length.toString(),
      icon: CheckCircle2,
      color: 'text-green-500',
    },
    {
      label: 'Failed',
      value: instances.filter((instance) => instance.state === 'rejected').length.toString(),
      icon: XCircle,
      color: 'text-red-500',
    },
    {
      label: 'Pending',
      value: instances.filter((instance) => instance.state === 'pending').length.toString(),
      icon: Clock,
      color: 'text-amber-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground">Monitor and manage active workflow instances and execution history.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <History className="mr-2 h-4 w-4" />
            Execution History
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn("p-2 rounded-full bg-muted", stat.color)}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search instances..."
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
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-sm text-muted-foreground">Loading workflow instances...</div>
          ) : isError ? (
            <div className="p-8 space-y-2">
              <p className="text-sm text-destructive">Failed to load workflow instances.</p>
              <p className="text-xs text-muted-foreground">
                {error instanceof Error ? error.message : 'Please retry.'}
              </p>
            </div>
          ) : filteredInstances.length === 0 ? (
            <div className="p-8 text-sm text-muted-foreground">No workflow instances found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Instance ID</TableHead>
                  <TableHead>Rule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInstances.map((instance) => (
                  <TableRow key={instance.id}>
                    <TableCell className="font-mono text-xs font-medium">{instance.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {instance.rule_id ?? 'n/a'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        instance.state === 'completed' || instance.state === 'approved' ? 'outline' : 
                        instance.state === 'rejected' ? 'destructive' : 'secondary'
                      } className="capitalize text-[10px]">
                        {instance.state}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(instance.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 text-xs">
                          Details
                          <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Play className="mr-2 h-4 w-4" />
                              Retry
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ArrowRight className="mr-2 h-4 w-4" />
                              Transition
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Terminate
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
