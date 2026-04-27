import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, RefreshCw, Search, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { adminApi } from '@/lib/api/endpoints';
import type { Integration } from '@/types';
import { cn } from '@/lib/utils';

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

function formatDateTime(value?: string) {
  return value ? new Date(value).toLocaleString() : 'Not connected yet';
}

export function IntegrationsPage() {
  const [search, setSearch] = React.useState('');

  const integrationsQuery = useQuery({
    queryKey: ['integrations'],
    queryFn: adminApi.getIntegrations,
    initialData: [] as Integration[],
  });

  const integrations = integrationsQuery.data ?? [];

  const filteredIntegrations = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return integrations;
    }

    return integrations.filter((integration) =>
      [integration.name, integration.type, integration.status].some((value) =>
        value.toLowerCase().includes(query)
      )
    );
  }, [integrations, search]);

  const activeCount = integrations.filter((integration) => integration.status === 'active').length;
  const attentionCount = integrations.filter((integration) => integration.status === 'error').length;
  const inactiveCount = integrations.filter((integration) => integration.status === 'inactive').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Connected Apps</h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            Review the tools linked to this workspace and see whether each connection is healthy.
          </p>
        </div>
        <Button variant="outline" onClick={() => void integrationsQuery.refetch()}>
          <RefreshCw className={`mr-2 h-4 w-4 ${integrationsQuery.isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Working normally</CardDescription>
            <CardTitle className="text-3xl">{activeCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Connected apps that look healthy right now.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Need attention</CardDescription>
            <CardTitle className="text-3xl">{attentionCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Connections that reported an issue the last time they ran.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Not active</CardDescription>
            <CardTitle className="text-3xl">{inactiveCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Saved connections that are not currently switched on.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Connected services</CardTitle>
              <CardDescription>Search by app name, connection type, or current status.</CardDescription>
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search connected apps"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>
          {integrationsQuery.isError ? (
            <p className="text-sm text-destructive">
              We could not load the latest connection details right now. You can refresh and try again.
            </p>
          ) : null}
        </CardHeader>
        <CardContent>
          {filteredIntegrations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredIntegrations.map((integration) => (
                <Card
                  key={integration.id}
                  className="border bg-background shadow-none"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted p-2">
                        <img
                          src={integrationIcons[integration.type] || 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png'}
                          alt={integration.type}
                          className="h-full w-full object-contain grayscale opacity-80"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        <CardDescription className="capitalize">
                          {integration.type.replace(/_/g, ' ')}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <div className="flex items-center gap-2">
                        {integration.status === 'active' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : integration.status === 'error' ? (
                          <XCircle className="h-4 w-4 text-destructive" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Badge
                          variant={integration.status === 'active' ? 'outline' : 'secondary'}
                          className={cn(integration.status === 'error' ? 'border-destructive/30 text-destructive' : '')}
                        >
                          {integration.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Last checked</span>
                      <span className="text-right text-muted-foreground">{formatDateTime(integration.lastSync)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Reference</span>
                      <span className="text-xs text-muted-foreground">{integration.id}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              {integrationsQuery.isFetching ? 'Loading connected apps...' : 'No connected apps to show yet.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
