import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  RefreshCw,
  Search, 
  MoreVertical, 
  Layers, 
  Settings, 
  Loader2,
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { adminApi } from '@/lib/api/endpoints';
import { Module } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function ModulesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState('');
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [newModule, setNewModule] = React.useState({
    name: '',
    code: '',
    description: '',
    isActive: true,
  });

  const { data: modules = [], isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['modules'],
    queryFn: adminApi.getModules,
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) => 
      adminApi.updateModule(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      toast.success('Module status updated');
    },
    onError: (mutationError: unknown) => {
      const message =
        typeof mutationError === 'object' &&
        mutationError &&
        'response' in mutationError &&
        typeof (mutationError as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message === 'string'
          ? (mutationError as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
          : 'Failed to update module status';
      toast.error(message);
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: Partial<Module>) => adminApi.createModule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modules'] });
      toast.success('Module created successfully');
      setIsCreateOpen(false);
      setNewModule({
        name: '',
        code: '',
        description: '',
        isActive: true,
      });
    },
    onError: (mutationError: unknown) => {
      const message =
        typeof mutationError === 'object' &&
        mutationError &&
        'response' in mutationError &&
        typeof (mutationError as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message === 'string'
          ? (mutationError as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
          : 'Failed to create module';
      toast.error(message);
    },
  });

  const filteredModules = modules.filter((m) => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    (m.description ?? '').toLowerCase().includes(search.toLowerCase()) ||
    m.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateModule = () => {
    const name = newModule.name.trim();
    const normalizedCode = newModule.code
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]+/g, '_')
      .replace(/^_+|_+$/g, '');
    const description = newModule.description.trim();

    if (name.length < 2) {
      toast.error('Module name must be at least 2 characters');
      return;
    }

    if (normalizedCode.length < 2) {
      toast.error('Module code must be at least 2 characters');
      return;
    }

    createMutation.mutate({
      name,
      code: normalizedCode,
      description: description || undefined,
      status: newModule.isActive ? 'active' : 'inactive',
      config: {},
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Modules</h1>
          <p className="text-muted-foreground">Enable and configure core platform capabilities for your tenant.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
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
        <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading modules...
          </CardContent>
        </Card>
      ) : isError ? (
        <Card>
          <CardContent className="p-8 space-y-3">
            <p className="text-sm text-destructive">Failed to load modules.</p>
            <p className="text-xs text-muted-foreground">
              {error instanceof Error ? error.message : 'Please check API access and try again.'}
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : filteredModules.length === 0 ? (
        <Card>
          <CardContent className="p-8 space-y-3">
            <p className="text-sm font-medium">No modules found.</p>
            <p className="text-xs text-muted-foreground">
              Create your first module to start capturing and organizing records.
            </p>
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create first module
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredModules.map((module) => (
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
                  disabled={toggleMutation.isPending && toggleMutation.variables?.id === module.id}
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
                <span className="text-[10px] text-muted-foreground">code: {module.code}</span>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                View Metrics
              </Button>
            </CardFooter>
          </Card>
          ))}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create module</DialogTitle>
            <DialogDescription>
              Modules define the domain for templates, records, and workflow rules.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="module-name">Name</Label>
              <Input
                id="module-name"
                placeholder="ESG"
                value={newModule.name}
                onChange={(event) => setNewModule((previous) => ({ ...previous, name: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="module-code">Code</Label>
              <Input
                id="module-code"
                placeholder="esg"
                value={newModule.code}
                onChange={(event) => setNewModule((previous) => ({ ...previous, code: event.target.value }))}
              />
              <p className="text-[11px] text-muted-foreground">
                Use lowercase letters, numbers, and underscores (for example: `energy_ops`).
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="module-description">Description</Label>
              <Textarea
                id="module-description"
                placeholder="Capture ESG intake data and anomaly checks."
                value={newModule.description}
                onChange={(event) => setNewModule((previous) => ({ ...previous, description: event.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Enable immediately</p>
                <p className="text-xs text-muted-foreground">Set module status to active after creation.</p>
              </div>
              <Switch
                checked={newModule.isActive}
                onCheckedChange={(checked) => setNewModule((previous) => ({ ...previous, isActive: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateModule} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create module'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
