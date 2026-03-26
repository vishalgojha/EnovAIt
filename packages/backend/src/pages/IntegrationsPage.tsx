import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  ExternalLink, 
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Settings2,
  Trash2
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
  DialogTrigger 
} from '@/components/ui/dialog';
import { adminApi } from '@/lib/api/endpoints';
import { Integration, IntegrationType } from '@/types';
import { toast } from 'sonner';

const integrationIcons: Record<string, string> = {
  whatsapp_official: 'https://cdn-icons-png.flaticon.com/512/733/733585.png',
  whatsapp_baileys: 'https://cdn-icons-png.flaticon.com/512/733/733585.png',
  email: 'https://cdn-icons-png.flaticon.com/512/732/732200.png',
  slack: 'https://cdn-icons-png.flaticon.com/512/3800/3800024.png',
  msteams: 'https://cdn-icons-png.flaticon.com/512/906/906349.png',
  sms: 'https://cdn-icons-png.flaticon.com/512/1077/1077976.png',
  voice_ivr: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
  iot_mqtt: 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png',
  erp_crm: 'https://cdn-icons-png.flaticon.com/512/1055/1055644.png',
  api_partner: 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png',
  web_widget: 'https://cdn-icons-png.flaticon.com/512/1055/1055644.png',
  mobile_sdk: 'https://cdn-icons-png.flaticon.com/512/1055/1055644.png',
};

export function IntegrationsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState('');

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: adminApi.getIntegrations,
    // Mock data if API fails
    initialData: [
      { id: 'i1', type: 'whatsapp_official', name: 'WhatsApp Business API', status: 'active', config: {}, lastSync: '2024-03-25T10:00:00Z' },
      { id: 'i2', type: 'slack', name: 'Slack Notifications', status: 'active', config: {}, lastSync: '2024-03-25T11:30:00Z' },
      { id: 'i3', type: 'email', name: 'SendGrid SMTP', status: 'error', config: {}, lastSync: '2024-03-24T15:00:00Z' },
      { id: 'i4', type: 'erp_crm', name: 'Salesforce Sync', status: 'inactive', config: {}, lastSync: '2024-03-20T09:00:00Z' },
    ] as Integration[],
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteIntegration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Integration deleted successfully');
    },
    onError: () => toast.error('Failed to delete integration'),
  });

  const filteredIntegrations = integrations?.filter(i => 
    i.name.toLowerCase().includes(search.toLowerCase()) || 
    i.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="text-muted-foreground">Manage your connections with external platforms and services.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Integration
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search integrations..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredIntegrations?.map((integration) => (
          <Card key={integration.id} className="overflow-hidden border-t-4" style={{ borderTopColor: integration.status === 'active' ? 'hsl(var(--primary))' : integration.status === 'error' ? 'hsl(var(--destructive))' : 'hsl(var(--muted))' }}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center p-2">
                  <img 
                    src={integrationIcons[integration.type] || 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png'} 
                    alt={integration.type}
                    className="w-full h-full object-contain grayscale opacity-80"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <CardTitle className="text-base">{integration.name}</CardTitle>
                  <CardDescription className="text-xs uppercase tracking-wider font-semibold">{integration.type.replace('_', ' ')}</CardDescription>
                </div>
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
                  <DropdownMenuItem>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={() => deleteMutation.mutate(integration.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-muted-foreground">Status</span>
                <div className="flex items-center gap-1.5">
                  {integration.status === 'active' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : integration.status === 'error' ? (
                    <XCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className={cn(
                    "font-medium capitalize",
                    integration.status === 'active' ? "text-green-500" : integration.status === 'error' ? "text-destructive" : "text-muted-foreground"
                  )}>
                    {integration.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Last Sync</span>
                <span>{integration.lastSync ? new Date(integration.lastSync).toLocaleString() : 'Never'}</span>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t p-3 flex justify-between">
              <Button variant="ghost" size="sm" className="text-xs h-8">
                View Logs
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-8">
                Documentation
                <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

import { cn } from '@/lib/utils';
