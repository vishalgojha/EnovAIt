import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Filter, 
  Play, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
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

  const { data: instances, isLoading } = useQuery({
    queryKey: ['workflow-instances'],
    queryFn: () => workflowApi.getInstances(),
    initialData: [
      { id: 'INST-001', rule_id: 'r1', state: 'completed', current_step: 'approved', payload: {}, history: [], created_at: '2024-03-26T10:00:00Z', last_transition_at: '2024-03-26T10:02:00Z' },
      { id: 'INST-002', rule_id: 'r2', state: 'pending', current_step: 'manager_approval', payload: {}, history: [], created_at: '2024-03-26T10:05:00Z', last_transition_at: '2024-03-26T10:06:00Z' },
      { id: 'INST-003', rule_id: 'r3', state: 'escalated', current_step: 'ops_review', payload: {}, history: [], created_at: '2024-03-26T10:10:00Z', last_transition_at: '2024-03-26T10:11:00Z' },
      { id: 'INST-004', rule_id: 'r4', state: 'rejected', current_step: 'closed', payload: {}, history: [], created_at: '2024-03-26T10:15:00Z', last_transition_at: '2024-03-26T10:16:00Z' },
      { id: 'INST-005', rule_id: 'r2', state: 'approved', current_step: 'complete', payload: {}, history: [], created_at: '2024-03-26T10:20:00Z', last_transition_at: '2024-03-26T10:21:00Z' },
    ] as WorkflowInstance[],
  });

  const filteredInstances = instances?.filter(i => 
    i.id.toLowerCase().includes(search.toLowerCase()) || 
    (i.rule_id ?? '').toLowerCase().includes(search.toLowerCase())
  );

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
        {[
          { label: 'Running', value: '12', icon: Play, color: 'text-blue-500' },
          { label: 'Completed', value: '1,242', icon: CheckCircle2, color: 'text-green-500' },
          { label: 'Failed', value: '24', icon: XCircle, color: 'text-red-500' },
          { label: 'Pending', value: '5', icon: Clock, color: 'text-amber-500' },
        ].map((stat) => (
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
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
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
              {filteredInstances?.map((instance) => (
                <TableRow key={instance.id}>
                  <TableCell className="font-mono text-xs font-medium">{instance.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {instance.rule_id ?? 'n/a'}
                      </Badge>
                      <span className="text-xs">User Signup Flow</span>
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
        </CardContent>
      </Card>
    </div>
  );
}
