import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { adminApi } from '@/lib/api/endpoints';
import { toast } from 'sonner';

export function SettingsPage() {
  const queryClient = useQueryClient();
  const [settingsText, setSettingsText] = React.useState('{}');

  const {
    data: orgSettings,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['org-settings'],
    queryFn: adminApi.getSettings,
  });

  React.useEffect(() => {
    if (orgSettings) {
      setSettingsText(JSON.stringify(orgSettings.settings ?? {}, null, 2));
    }
  }, [orgSettings]);

  const updateMutation = useMutation({
    mutationFn: (settings: Record<string, unknown>) => adminApi.updateSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-settings'] });
      toast.success('Settings updated');
    },
    onError: (mutationError: unknown) => {
      const message =
        typeof mutationError === 'object' &&
        mutationError &&
        'response' in mutationError &&
        typeof (mutationError as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message === 'string'
          ? (mutationError as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
          : 'Failed to update settings';
      toast.error(message);
    },
  });

  const handleSave = () => {
    let parsed: Record<string, unknown>;

    try {
      parsed = JSON.parse(settingsText) as Record<string, unknown>;
    } catch {
      toast.error('Settings must be valid JSON');
      return;
    }

    updateMutation.mutate(parsed);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage organization-level configuration as JSON.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Settings</CardTitle>
          <CardDescription>
            {orgSettings ? `${orgSettings.name} (${orgSettings.slug})` : 'Loading organization...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading settings...</p>
          ) : isError ? (
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : 'Failed to load settings'}
            </p>
          ) : (
            <>
              <Textarea
                className="font-mono min-h-[320px]"
                value={settingsText}
                onChange={(event) => setSettingsText(event.target.value)}
              />
              <Button onClick={handleSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
