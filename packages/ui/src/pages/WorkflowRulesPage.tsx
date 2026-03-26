import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  GitBranch, 
  Play, 
  MoreVertical,
  Edit,
  Trash2,
  Zap,
  ArrowRight
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
import { Switch } from '@/components/ui/switch';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { adminApi } from '@/lib/api/endpoints';
import { WorkflowRule } from '@/types';
import { cn } from '@/lib/utils';

export function WorkflowRulesPage() {
  const [search, setSearch] = React.useState('');

  const { data: rules, isLoading } = useQuery({
    queryKey: ['workflow-rules'],
    queryFn: adminApi.getWorkflowRules,
    initialData: [
      { id: 'r1', module_id: 'm1', name: 'High Severity Approval', trigger_event: 'record.completed', condition: { path: 'severity', operator: 'eq', value: 'high' }, action: { state: 'pending' }, priority: 10, is_active: true },
      { id: 'r2', module_id: 'm2', name: 'Escalate Critical', trigger_event: 'record.completed', condition: { path: 'severity', operator: 'eq', value: 'critical' }, action: { state: 'escalated' }, priority: 20, is_active: true },
    ] as WorkflowRule[],
  });

  const filteredRules = rules?.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.trigger_event.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflow Rules</h1>
          <p className="text-muted-foreground">Define automated actions based on system events and conditions.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Rule
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rules..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredRules?.map((rule) => (
          <Card key={rule.id} className="group overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center p-4 gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                  rule.is_active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  <GitBranch className="h-5 w-5" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{rule.name}</h3>
                    <Badge variant="outline" className="text-[10px] font-mono uppercase">
                      {rule.trigger_event}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Zap className="h-3 w-3" />
                      <span>3 Actions</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ArrowRight className="h-3 w-3" />
                      <span>Last run 5m ago</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">Status</span>
                    <Switch checked={rule.is_active} />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Rule
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Play className="mr-2 h-4 w-4" />
                        Test Run
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
