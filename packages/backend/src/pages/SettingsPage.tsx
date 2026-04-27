import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { adminApi } from '@/lib/api/endpoints';
import { useAuthStore } from '@/lib/store/auth';

function formatDateTime(value?: string | null) {
  return value ? new Date(value).toLocaleString() : 'Not available yet';
}

export function SettingsPage() {
  const queryClient = useQueryClient();
  const updateTenant = useAuthStore((state) => state.updateTenant);
  const tenant = useAuthStore((state) => state.tenant);
  const [draft, setDraft] = React.useState('{}');
  const [jsonError, setJsonError] = React.useState<string | null>(null);

  const settingsQuery = useQuery({
    queryKey: ['workspace-settings'],
    queryFn: adminApi.getSettings,
  });

  React.useEffect(() => {
    if (!settingsQuery.data) {
      return;
    }

    setDraft(JSON.stringify(settingsQuery.data.settings ?? {}, null, 2));
    setJsonError(null);
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: adminApi.updateSettings,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workspace-settings'] });
      updateTenant({
        id: data.id,
        name: data.name,
        slug: data.slug,
        settings: data.settings,
      });
      setDraft(JSON.stringify(data.settings ?? {}, null, 2));
      setJsonError(null);
      toast.success('Workspace settings saved');
    },
    onError: () => {
      toast.error('Could not save the workspace settings');
    },
  });

  const workspaceName = settingsQuery.data?.name ?? tenant?.name ?? 'Workspace';
  const workspaceSlug = settingsQuery.data?.slug ?? tenant?.slug ?? 'workspace';

  const handleSave = () => {
    try {
      const parsed = JSON.parse(draft);

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        setJsonError('Settings need to stay in JSON object format.');
        return;
      }

      setJsonError(null);
      saveMutation.mutate(parsed as Record<string, unknown>);
    } catch {
      setJsonError('Please fix the JSON formatting before saving.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Workspace Settings</h1>
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            Review the shared workspace details and update the saved preferences used across the app.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void settingsQuery.refetch()}>
            <RefreshCw className={`mr-2 h-4 w-4 ${settingsQuery.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending || settingsQuery.isLoading}>
            <Save className="mr-2 h-4 w-4" />
            Save changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Workspace details</CardTitle>
            <CardDescription>The basic information currently saved for this workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-name">Name</Label>
              <Input id="workspace-name" value={workspaceName} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workspace-slug">Workspace code</Label>
              <Input id="workspace-slug" value={workspaceSlug} readOnly />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={settingsQuery.data?.is_active === false ? 'secondary' : 'outline'}>
                {settingsQuery.data?.is_active === false ? 'Inactive' : 'Active'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Last updated: {formatDateTime(settingsQuery.data?.updated_at)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shared preferences</CardTitle>
            <CardDescription>
              These saved preferences shape how the workspace behaves. Keep the JSON valid before saving.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="workspace-settings-json">Settings JSON</Label>
              <Textarea
                id="workspace-settings-json"
                className="min-h-[420px] font-mono text-sm"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                spellCheck={false}
              />
            </div>
            {jsonError ? <p className="text-sm text-destructive">{jsonError}</p> : null}
            {settingsQuery.isError ? (
              <p className="text-sm text-destructive">
                We could not load the latest settings right now. You can refresh and try again.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
