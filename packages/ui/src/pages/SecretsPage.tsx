import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { AlertTriangle, CheckCircle2, Copy, Lock, Save, ShieldCheck, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { BlockGuide } from '@/components/layout/BlockGuide';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { adminApi } from '@/lib/api/endpoints';
import { useAuthStore } from '@/lib/store/auth';

const secretsTemplate = `SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Choose one AI provider
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your-anthropic-key

# AI_PROVIDER=openrouter
# OPENROUTER_API_KEY=your-openrouter-key

# AI_PROVIDER=openai_compatible
# OPENAI_BASE_URL=https://your-openai-compatible-endpoint/v1
`;

type Provider = 'anthropic' | 'openrouter' | 'openai_compatible';

export function SecretsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'super_admin';
  const [copied, setCopied] = React.useState(false);
  const [savedMessage, setSavedMessage] = React.useState<string | null>(null);
  const [provider, setProvider] = React.useState<Provider>('anthropic');
  const [form, setForm] = React.useState({
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',
    SUPABASE_SERVICE_ROLE_KEY: '',
    SUPABASE_JWT_SECRET: '',
    ANTHROPIC_API_KEY: '',
    OPENROUTER_API_KEY: '',
    OPENAI_BASE_URL: '',
    OPENAI_API_KEY: '',
  });

  const { data: status } = useQuery({
    queryKey: ['platform-secrets'],
    queryFn: adminApi.getPlatformSecrets,
    enabled: isSuperAdmin,
  });

  React.useEffect(() => {
    if (status?.aiProvider === 'anthropic' || status?.aiProvider === 'openrouter' || status?.aiProvider === 'openai_compatible') {
      setProvider(status.aiProvider);
    }
  }, [status?.aiProvider]);

  const saveMutation = useMutation({
    mutationFn: adminApi.savePlatformSecrets,
    onSuccess: (data) => {
      setSavedMessage(data.message);
      toast.success('Secrets saved');
    },
    onError: () => {
      toast.error('Could not save secrets');
    },
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(secretsTemplate);
      setCopied(true);
      toast.success('Secrets template copied');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy template');
    }
  };

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    saveMutation.mutate({
      SUPABASE_URL: form.SUPABASE_URL.trim(),
      SUPABASE_ANON_KEY: form.SUPABASE_ANON_KEY.trim(),
      SUPABASE_SERVICE_ROLE_KEY: form.SUPABASE_SERVICE_ROLE_KEY.trim(),
      SUPABASE_JWT_SECRET: form.SUPABASE_JWT_SECRET.trim(),
      AI_PROVIDER: provider,
      ANTHROPIC_API_KEY: provider === 'anthropic' ? form.ANTHROPIC_API_KEY.trim() : undefined,
      OPENROUTER_API_KEY: provider === 'openrouter' ? form.OPENROUTER_API_KEY.trim() : undefined,
      OPENAI_BASE_URL: provider === 'openai_compatible' ? form.OPENAI_BASE_URL.trim() : undefined,
      OPENAI_API_KEY: provider === 'openai_compatible' ? form.OPENAI_API_KEY.trim() || undefined : undefined,
    });
  };

  if (!isSuperAdmin) {
    return (
      <Card className="rounded-[1.8rem] border-white/70 bg-white/90 shadow-none">
        <CardContent className="flex items-center gap-3 p-6">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <div>
            <p className="text-sm font-semibold">Secrets environment is restricted</p>
            <p className="text-xs text-muted-foreground">Only EnovAIt super admins can view the secrets template and platform setup notes.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const requiredFlags = status?.required ?? {
    SUPABASE_URL: false,
    SUPABASE_ANON_KEY: false,
    SUPABASE_SERVICE_ROLE_KEY: false,
    SUPABASE_JWT_SECRET: false,
  };

  return (
    <div className="space-y-6">
      <BlockGuide
        eyebrow="Super admin"
        title="Save backend secrets from the browser"
        description="Enter the required Supabase values and one AI provider here. EnovAIt will write them to the server-side .env file, then the backend needs a restart to pick them up."
        points={[
          { title: 'Required platform keys', detail: 'Supabase URL, anon key, service role key, and JWT secret are needed for auth and platform access.' },
          { title: 'Choose one AI provider', detail: 'Use Anthropic, OpenRouter, or an OpenAI-compatible endpoint. Only one needs to be active.' },
          { title: 'Restart after save', detail: 'The file is updated immediately, but the running backend must restart before the new values take effect.' },
        ]}
        secondaryLabel="Go to platform"
        onSecondaryClick={() => navigate('/dashboard/platform')}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[1.6rem] border-white/70 bg-white/90 shadow-none">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Scope</p>
              <p className="mt-2 text-lg font-semibold">Super admin only</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
        <Card className="rounded-[1.6rem] border-white/70 bg-white/90 shadow-none">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Storage</p>
              <p className="mt-2 text-lg font-semibold">Backend `.env`</p>
            </div>
            <Lock className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
        <Card className="rounded-[1.6rem] border-white/70 bg-white/90 shadow-none">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Provider</p>
              <p className="mt-2 text-lg font-semibold">{provider}</p>
            </div>
            <Sparkles className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_360px]">
        <Card className="rounded-[1.8rem] border-white/70 bg-white/90 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Secrets environment</CardTitle>
              <CardDescription>Fill this form and save it to the server. No secret values are shown back in the browser.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full">
                {status?.path ?? 'backend .env'}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                {copied ? 'Copied' : 'Copy template'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSave}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="supabase-url">Supabase URL</Label>
                  <Input
                    id="supabase-url"
                    placeholder="https://your-project.supabase.co"
                    value={form.SUPABASE_URL}
                    onChange={(event) => updateField('SUPABASE_URL', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supabase-anon">Supabase anon key</Label>
                  <Input
                    id="supabase-anon"
                    placeholder="Paste anon key here"
                    value={form.SUPABASE_ANON_KEY}
                    onChange={(event) => updateField('SUPABASE_ANON_KEY', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supabase-service">Supabase service role key</Label>
                  <Input
                    id="supabase-service"
                    placeholder="Paste service role key here"
                    value={form.SUPABASE_SERVICE_ROLE_KEY}
                    onChange={(event) => updateField('SUPABASE_SERVICE_ROLE_KEY', event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supabase-jwt">Supabase JWT secret</Label>
                  <Input
                    id="supabase-jwt"
                    placeholder="Paste JWT secret here"
                    value={form.SUPABASE_JWT_SECRET}
                    onChange={(event) => updateField('SUPABASE_JWT_SECRET', event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3 rounded-[1.4rem] bg-muted/30 p-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-provider">AI provider</Label>
                  <select
                    id="ai-provider"
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    value={provider}
                    onChange={(event) => setProvider(event.target.value as Provider)}
                  >
                    <option value="anthropic">Anthropic</option>
                    <option value="openrouter">OpenRouter</option>
                    <option value="openai_compatible">OpenAI compatible</option>
                  </select>
                </div>

                {provider === 'anthropic' ? (
                  <div className="space-y-2">
                    <Label htmlFor="anthropic-key">Anthropic API key</Label>
                    <Input
                      id="anthropic-key"
                      placeholder="Paste Anthropic API key"
                      value={form.ANTHROPIC_API_KEY}
                      onChange={(event) => updateField('ANTHROPIC_API_KEY', event.target.value)}
                    />
                  </div>
                ) : null}

                {provider === 'openrouter' ? (
                  <div className="space-y-2">
                    <Label htmlFor="openrouter-key">OpenRouter API key</Label>
                    <Input
                      id="openrouter-key"
                      placeholder="Paste OpenRouter API key"
                      value={form.OPENROUTER_API_KEY}
                      onChange={(event) => updateField('OPENROUTER_API_KEY', event.target.value)}
                    />
                  </div>
                ) : null}

                {provider === 'openai_compatible' ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="openai-base-url">OpenAI-compatible base URL</Label>
                      <Input
                        id="openai-base-url"
                        placeholder="https://your-endpoint/v1"
                        value={form.OPENAI_BASE_URL}
                        onChange={(event) => updateField('OPENAI_BASE_URL', event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="openai-key">OpenAI-compatible API key</Label>
                      <Input
                        id="openai-key"
                        placeholder="Paste compatible API key"
                        value={form.OPENAI_API_KEY}
                        onChange={(event) => updateField('OPENAI_API_KEY', event.target.value)}
                      />
                    </div>
                  </>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Save to server</p>
                  <p className="text-sm text-muted-foreground">
                    The file updates immediately. Restart the backend once to apply the new values.
                  </p>
                </div>
                <Button type="submit" disabled={saveMutation.isPending}>
                  <Save className="mr-2 h-4 w-4" />
                  {saveMutation.isPending ? 'Saving...' : 'Save secrets'}
                </Button>
              </div>

              {savedMessage ? (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-900">
                  <CheckCircle2 className="mt-0.5 h-5 w-5" />
                  <div>
                    <p className="text-sm font-medium">{savedMessage}</p>
                    <p className="text-xs">Restart the backend service on the server so these values take effect.</p>
                  </div>
                </div>
              ) : null}
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-[1.8rem] border-white/70 bg-white/90 shadow-none">
            <CardHeader>
              <CardTitle>Current status</CardTitle>
              <CardDescription>These flags tell you whether the required values are present in the server file.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {([
                ['SUPABASE_URL', requiredFlags.SUPABASE_URL],
                ['SUPABASE_ANON_KEY', requiredFlags.SUPABASE_ANON_KEY],
                ['SUPABASE_SERVICE_ROLE_KEY', requiredFlags.SUPABASE_SERVICE_ROLE_KEY],
                ['SUPABASE_JWT_SECRET', requiredFlags.SUPABASE_JWT_SECRET],
              ] as const).map(([label, present]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl bg-muted/35 px-4 py-3">
                  <p className="text-sm font-medium">{label}</p>
                  <Badge variant={present ? 'default' : 'secondary'} className="rounded-full">
                    {present ? 'Saved' : 'Missing'}
                  </Badge>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-2xl bg-muted/35 px-4 py-3">
                <p className="text-sm font-medium">AI provider</p>
                <Badge variant="secondary" className="rounded-full">
                  {status?.aiProvider ?? 'Not set'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.8rem] border-white/70 bg-[#f6f7f4]/90 shadow-none">
            <CardHeader>
              <CardTitle>Template preview</CardTitle>
              <CardDescription>This is what the setup person can copy if they want a manual fallback.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap rounded-[1.3rem] bg-white px-4 py-4 text-xs leading-6 text-foreground shadow-sm">
                {secretsTemplate}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
