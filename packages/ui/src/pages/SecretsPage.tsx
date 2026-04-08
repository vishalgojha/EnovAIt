import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Copy, Lock, ShieldCheck, Sparkles } from 'lucide-react';

import { BlockGuide } from '@/components/layout/BlockGuide';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/lib/store/auth';
import { toast } from 'sonner';

const secretsTemplate = `SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Optional AI providers
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=your-anthropic-key

# AI_PROVIDER=openrouter
# OPENROUTER_API_KEY=your-openrouter-key

# AI_PROVIDER=openai_compatible
# OPENAI_BASE_URL=https://your-openai-compatible-endpoint/v1
# OPENAI_API_KEY=your-compatible-key
`;

export function SecretsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'super_admin';
  const [copied, setCopied] = React.useState(false);

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

  return (
    <div className="space-y-6">
      <BlockGuide
        eyebrow="Super admin"
        title="Keep platform secrets in one controlled environment"
        description="Use this page as the operator guide for backend environment values. The template is safe to copy into the server-side .env file and should never contain live secrets in the browser."
        points={[
          { title: 'Required platform keys', detail: 'Supabase URL, anon key, service role key, and JWT secret are required for auth and tenant operations.' },
          { title: 'Optional AI provider keys', detail: 'Choose one provider at a time: Anthropic, OpenRouter, or an OpenAI-compatible endpoint.' },
          { title: 'Server-side only', detail: 'Store the actual values in the backend .env on the deployment host and rotate them per environment.' },
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
              <p className="mt-2 text-lg font-semibold">One active AI key</p>
            </div>
            <Sparkles className="h-5 w-5 text-primary" />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[1.8rem] border-white/70 bg-white/90 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Secrets environment template</CardTitle>
            <CardDescription>Copy this into the server-side `.env` file and replace placeholders with real deployment values.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="rounded-full">
              EnovAIt platform
            </Badge>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="mr-2 h-4 w-4" />
              {copied ? 'Copied' : 'Copy template'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={secretsTemplate}
            readOnly
            className="min-h-[320px] rounded-[1.4rem] border-white/70 bg-muted/25 font-mono text-xs leading-6"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-muted/35 px-4 py-4">
              <p className="text-sm font-medium">Required values</p>
              <p className="mt-1 text-sm text-muted-foreground">
                `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_JWT_SECRET`.
              </p>
            </div>
            <div className="rounded-2xl bg-muted/35 px-4 py-4">
              <p className="text-sm font-medium">Optional AI values</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Use `AI_PROVIDER=anthropic`, `openrouter`, or `openai_compatible` with the matching key or base URL.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
