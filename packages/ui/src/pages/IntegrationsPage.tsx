import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, MoreVertical, Plus, RefreshCw, Settings2, Trash2, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminApi } from '@/lib/api/endpoints';
import { cn } from '@/lib/utils';
import { Integration, IntegrationType } from '@/types';
import { toast } from 'sonner';

const integrationOptions: Array<{ value: IntegrationType; label: string }> = [
  { value: 'whatsapp_official', label: 'WhatsApp Official' },
  { value: 'whatsapp_baileys', label: 'WhatsApp Baileys' },
  { value: 'email', label: 'Email' },
  { value: 'slack', label: 'Slack' },
  { value: 'msteams', label: 'Microsoft Teams' },
  { value: 'sms', label: 'SMS' },
  { value: 'voice_ivr', label: 'Voice IVR' },
  { value: 'iot_mqtt', label: 'IoT MQTT' },
  { value: 'erp_crm', label: 'ERP / CRM' },
  { value: 'api_partner', label: 'API Partner' },
];

const toStatusTone = (status: Integration['status']) => {
  if (status === 'active') {
    return {
      icon: CheckCircle2,
      iconClassName: 'text-green-500',
      textClassName: 'text-green-500',
    };
  }

  if (status === 'error') {
    return {
      icon: XCircle,
      iconClassName: 'text-destructive',
      textClassName: 'text-destructive',
    };
  }

  return {
    icon: AlertCircle,
    iconClassName: 'text-muted-foreground',
    textClassName: 'text-muted-foreground',
  };
};

export function IntegrationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState('');
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [newIntegration, setNewIntegration] = React.useState<{
    name: string;
    type: IntegrationType;
    isActive: boolean;
  }>({
    name: '',
    type: 'api_partner',
    isActive: true,
  });

  const {
    data: integrations = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['integrations'],
    queryFn: adminApi.getIntegrations,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      adminApi.createIntegration({
        name: newIntegration.name.trim(),
        type: newIntegration.type,
        status: newIntegration.isActive ? 'active' : 'inactive',
        config: {},
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Integration created');
      setIsCreateOpen(false);
      setNewIntegration({
        name: '',
        type: 'api_partner',
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
          : 'Failed to create integration';
      toast.error(message);
    },
  });

  const disableMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteIntegration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Integration disabled');
    },
    onError: () => toast.error('Failed to disable integration'),
  });

  const filteredIntegrations = integrations.filter(
    (integration) =>
      integration.name.toLowerCase().includes(search.toLowerCase()) ||
      integration.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = () => {
    if (newIntegration.name.trim().length < 2) {
      toast.error('Integration name must be at least 2 characters');
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">Manage your real external channel and platform integrations.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Integration
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search integrations..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-9"
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">Loading integrations...</CardContent>
        </Card>
      ) : isError ? (
        <Card>
          <CardContent className="p-8 space-y-3">
            <p className="text-sm text-destructive">Failed to load integrations.</p>
            <p className="text-xs text-muted-foreground">
              {error instanceof Error ? error.message : 'Please check API access and try again.'}
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : filteredIntegrations.length === 0 ? (
        <Card>
          <CardContent className="p-8 space-y-3">
            <p className="text-sm font-medium">No integrations found.</p>
            <p className="text-xs text-muted-foreground">Add your first integration to start sending through live channels.</p>
            <Button size="sm" onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add first integration
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredIntegrations.map((integration) => {
            const tone = toStatusTone(integration.status);
            const Icon = tone.icon;

            return (
              <Card key={integration.id} className="overflow-hidden border-t-4 border-t-primary/40">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-base">{integration.name}</CardTitle>
                    <CardDescription className="text-xs uppercase tracking-wider font-semibold">
                      {integration.type.replace('_', ' ')}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Settings2 className="mr-2 h-4 w-4" />
                        Configure
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => disableMutation.mutate(integration.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Disable
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-muted-foreground">Status</span>
                    <div className="flex items-center gap-1.5">
                      <Icon className={cn('h-4 w-4', tone.iconClassName)} />
                      <span className={cn('font-medium capitalize', tone.textClassName)}>{integration.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Last Updated</span>
                    <span>{integration.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never'}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add integration</DialogTitle>
            <DialogDescription>Create a real integration record for your organization.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="integration-name">Name</Label>
              <Input
                id="integration-name"
                placeholder="Slack Notifications"
                value={newIntegration.name}
                onChange={(event) =>
                  setNewIntegration((previous) => ({ ...previous, name: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="integration-type">Type</Label>
              <Select
                value={newIntegration.type}
                onValueChange={(value) =>
                  setNewIntegration((previous) => ({ ...previous, type: value as IntegrationType }))
                }
              >
                <SelectTrigger id="integration-type">
                  <SelectValue placeholder="Select integration type" />
                </SelectTrigger>
                <SelectContent>
                  {integrationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Enable immediately</p>
                <p className="text-xs text-muted-foreground">Set integration status to active on creation.</p>
              </div>
              <Button
                variant={newIntegration.isActive ? 'default' : 'outline'}
                size="sm"
                onClick={() =>
                  setNewIntegration((previous) => ({ ...previous, isActive: !previous.isActive }))
                }
              >
                {newIntegration.isActive ? 'Active' : 'Inactive'}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create integration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
