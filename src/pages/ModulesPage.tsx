import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Layers, 
  Settings, 
  Power,
  Trash2,
  Info
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
import { Module } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function ModulesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState('');

  const { data: modules, isLoading } = useQuery({
    queryKey: ['modules'],
    queryFn: adminApi.getModules,
    initialData: [
      { id: 'm1', code: 'esg', name: 'ESG', description: 'Capture ESG intake data', status: 'active', config: {} },
      { id: 'm2', code: 'maintenance', name: 'Maintenance', description: 'Track maintenance records', status: 'active', config: {} },
      { id: 'm3', code: 'compliance', name: 'Compliance', description: 'Compliance evidence collection', status: 'inactive', config: {} },
    ] as Module[],
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) => 
      adminApi.updateModule(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      toast.success('Module status updated');
    },
  });

  const filteredModules = modules?.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modules</h1>
          <p className="text-muted-foreground">Enable and configure core platform capabilities for your tenant.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Module
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search modules..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filteredModules?.map((module) => (
          <Card key={module.id} className={cn(
            "transition-all border-l-4",
            module.status === 'active' ? "border-l-primary" : "border-l-muted"
          )}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  module.status === 'active' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg">{module.name}</CardTitle>
                  <CardDescription className="text-xs font-mono uppercase">{module.code}</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch 
                  checked={module.status === 'active'} 
                  onCheckedChange={(checked) => toggleMutation.mutate({ id: module.id, status: checked ? 'active' : 'inactive' })}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Configuration
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Info className="mr-2 h-4 w-4" />
                      Documentation
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Uninstall
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {module.description}
              </p>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t p-3 flex justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={module.status === 'active' ? "default" : "secondary"} className="text-[10px] h-5">
                  {module.status === 'active' ? "Active" : "Disabled"}
                </Badge>
                <span className="text-[10px] text-muted-foreground">v1.2.4</span>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                View Metrics
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
