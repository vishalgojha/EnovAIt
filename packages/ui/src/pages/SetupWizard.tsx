import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ExternalLink,
  Globe,
  Key,
  Loader2,
  Play,
  Rocket,
  Server,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress, ProgressIndicator, ProgressTrack } from '@/components/ui/progress';
import { adminApi } from '@/lib/api/endpoints';
import { useAuthStore } from '@/lib/store/auth';

type Step = 1 | 2 | 3;

interface SupabaseForm {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  SUPABASE_JWT_SECRET: string;
}

interface AiForm {
  AI_PROVIDER: 'anthropic' | 'openrouter' | 'openai_compatible';
  ANTHROPIC_API_KEY: string;
  OPENROUTER_API_KEY: string;
  OPENAI_BASE_URL: string;
  OPENAI_API_KEY: string;
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  const steps = [
    { num: 1, label: 'Connect Supabase' },
    { num: 2, label: 'Enable AI' },
    { num: 3, label: "You're ready" },
  ];

  return (
    <div className="w-full">
      <Progress value={(current / total) * 100} className="mb-6">
        <ProgressTrack />
        <ProgressIndicator />
      </Progress>
      <div className="flex items-center justify-between">
        {steps.map((step) => (
          <div key={step.num} className="flex flex-col items-center gap-1.5">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                step.num < current
                  ? 'bg-emerald-500 text-white'
                  : step.num === current
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
              }`}
            >
              {step.num < current ? <Check className="h-4 w-4" /> : step.num}
            </div>
            <span
              className={`text-xs font-medium ${
                step.num <= current ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function SetupWizardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === 'super_admin';
  const [step, setStep] = React.useState<Step>(1);
  const [supabaseForm, setSupabaseForm] = React.useState<SupabaseForm>({
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',
    SUPABASE_SERVICE_ROLE_KEY: '',
    SUPABASE_JWT_SECRET: '',
  });
  const [aiForm, setAiForm] = React.useState<AiForm>({
    AI_PROVIDER: 'anthropic',
    ANTHROPIC_API_KEY: '',
    OPENROUTER_API_KEY: '',
    OPENAI_BASE_URL: '',
    OPENAI_API_KEY: '',
  });
  const [testingUrl, setTestingUrl] = React.useState(false);
  const [urlTestResult, setUrlTestResult] = React.useState<'ok' | 'error' | null>(null);

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['platform-secrets'],
    queryFn: adminApi.getPlatformSecrets,
    enabled: isSuperAdmin,
  });

  // Redirect to dashboard if already configured
  React.useEffect(() => {
    if (status) {
      const required = status.required;
      const allPresent =
        required.SUPABASE_URL &&
        required.SUPABASE_ANON_KEY &&
        required.SUPABASE_SERVICE_ROLE_KEY &&
        required.SUPABASE_JWT_SECRET;
      if (allPresent) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [status, navigate]);

  const saveMutation = useMutation({
    mutationFn: adminApi.savePlatformSecrets,
    onSuccess: () => {
      toast.success('Configuration saved successfully');
      setStep(3);
    },
    onError: () => {
      toast.error('Could not save configuration');
    },
  });

  const testSupabaseUrl = async () => {
    const url = supabaseForm.SUPABASE_URL.trim();
    if (!url) {
      toast.error('Please enter a Supabase URL');
      return;
    }
    if (!isValidUrl(url)) {
      setUrlTestResult('error');
      toast.error('Invalid URL format. Expected: https://your-project.supabase.co');
      return;
    }
    setTestingUrl(true);
    setUrlTestResult(null);
    try {
      const response = await fetch(`${url}/rest/v1/`, {
        method: 'HEAD',
        mode: 'no-cors',
      });
      // no-cors always succeeds, but if it reaches here the URL is reachable
      setUrlTestResult('ok');
      toast.success('Supabase URL looks valid');
    } catch {
      setUrlTestResult('error');
      toast.error('Could not reach Supabase URL');
    } finally {
      setTestingUrl(false);
    }
  };

  const updateSupabaseField = (field: keyof SupabaseForm, value: string) => {
    setSupabaseForm((current) => ({ ...current, [field]: value }));
  };

  const updateAiField = (field: keyof AiForm, value: string) => {
    setAiForm((current) => ({ ...current, [field]: value }));
  };

  const handleCompleteSetup = () => {
    saveMutation.mutate({
      SUPABASE_URL: supabaseForm.SUPABASE_URL.trim(),
      SUPABASE_ANON_KEY: supabaseForm.SUPABASE_ANON_KEY.trim(),
      SUPABASE_SERVICE_ROLE_KEY: supabaseForm.SUPABASE_SERVICE_ROLE_KEY.trim(),
      SUPABASE_JWT_SECRET: supabaseForm.SUPABASE_JWT_SECRET.trim(),
      AI_PROVIDER: aiForm.AI_PROVIDER,
      ANTHROPIC_API_KEY: aiForm.AI_PROVIDER === 'anthropic' ? aiForm.ANTHROPIC_API_KEY.trim() : undefined,
      OPENROUTER_API_KEY: aiForm.AI_PROVIDER === 'openrouter' ? aiForm.OPENROUTER_API_KEY.trim() : undefined,
      OPENAI_BASE_URL: aiForm.AI_PROVIDER === 'openai_compatible' ? aiForm.OPENAI_BASE_URL.trim() : undefined,
      OPENAI_API_KEY: aiForm.AI_PROVIDER === 'openai_compatible' ? aiForm.OPENAI_API_KEY.trim() || undefined : undefined,
    });
  };

  const canProceedStep1 =
    supabaseForm.SUPABASE_URL.trim() &&
    isValidUrl(supabaseForm.SUPABASE_URL.trim()) &&
    supabaseForm.SUPABASE_ANON_KEY.trim() &&
    supabaseForm.SUPABASE_SERVICE_ROLE_KEY.trim() &&
    supabaseForm.SUPABASE_JWT_SECRET.trim();

  const canProceedStep2 =
    (aiForm.AI_PROVIDER === 'anthropic' && aiForm.ANTHROPIC_API_KEY.trim()) ||
    (aiForm.AI_PROVIDER === 'openrouter' && aiForm.OPENROUTER_API_KEY.trim()) ||
    (aiForm.AI_PROVIDER === 'openai_compatible' && aiForm.OPENAI_BASE_URL.trim());

  // Show access denied for non-super-admins
  if (!isSuperAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-md rounded-[1.8rem] border-white/70 bg-white/90 shadow-none">
          <CardContent className="flex items-center gap-3 p-6">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-sm font-semibold">Access restricted</p>
              <p className="text-xs text-muted-foreground">Only EnovAIt super admins can run the setup wizard.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state while checking status
  if (statusLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-sm">Checking configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-2xl">
        {/* Logo / Brand */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary">
            <Rocket className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">EnovAIt Setup</h1>
          <p className="text-sm text-muted-foreground">
            Get your platform running in three quick steps
          </p>
        </div>

        <Card className="rounded-[1.8rem] border-white/70 bg-white/90 shadow-none">
          <CardHeader className="pb-4">
            <StepIndicator current={step} total={3} />
          </CardHeader>

          <CardContent>
            {/* Step 1: Connect Supabase */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Server className="h-5 w-5 text-primary" />
                    Connect Supabase
                  </CardTitle>
                  <CardDescription className="mt-2">
                    EnovAIt uses Supabase for authentication and data storage. You need a Supabase project —{' '}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      create one at supabase.com
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </CardDescription>
                </div>

                <div className="rounded-[1.2rem] bg-muted/40 p-4 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Where to find these values:</p>
                  <p className="mt-1">
                    Go to your Supabase Dashboard → <strong>Settings</strong> → <strong>API</strong>.
                    The project URL is shown at the top. The anon and service role keys are in the
                    "Project API keys" section. The JWT secret is also on this page.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="supabase-url">Supabase URL</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 px-2 text-xs"
                        onClick={testSupabaseUrl}
                        disabled={testingUrl || !supabaseForm.SUPABASE_URL.trim()}
                      >
                        {testingUrl ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : urlTestResult === 'ok' ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        ) : urlTestResult === 'error' ? (
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                        {testingUrl ? 'Testing...' : 'Test URL'}
                      </Button>
                    </div>
                    <Input
                      id="supabase-url"
                      placeholder="https://your-project.supabase.co"
                      value={supabaseForm.SUPABASE_URL}
                      onChange={(e) => {
                        updateSupabaseField('SUPABASE_URL', e.target.value);
                        setUrlTestResult(null);
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supabase-anon" className="flex items-center gap-1.5">
                      <Key className="h-3.5 w-3.5 text-muted-foreground" />
                      Supabase anon key
                    </Label>
                    <Input
                      id="supabase-anon"
                      placeholder="Paste anon key here"
                      value={supabaseForm.SUPABASE_ANON_KEY}
                      onChange={(e) => updateSupabaseField('SUPABASE_ANON_KEY', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supabase-service" className="flex items-center gap-1.5">
                      <Key className="h-3.5 w-3.5 text-muted-foreground" />
                      Supabase service role key
                    </Label>
                    <Input
                      id="supabase-service"
                      placeholder="Paste service role key here"
                      value={supabaseForm.SUPABASE_SERVICE_ROLE_KEY}
                      onChange={(e) => updateSupabaseField('SUPABASE_SERVICE_ROLE_KEY', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supabase-jwt" className="flex items-center gap-1.5">
                      <Key className="h-3.5 w-3.5 text-muted-foreground" />
                      Supabase JWT secret
                    </Label>
                    <Input
                      id="supabase-jwt"
                      placeholder="Paste JWT secret here"
                      value={supabaseForm.SUPABASE_JWT_SECRET}
                      onChange={(e) => updateSupabaseField('SUPABASE_JWT_SECRET', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    size="lg"
                    className="gap-2 rounded-full"
                    disabled={!canProceedStep1}
                    onClick={() => setStep(2)}
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Enable AI */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Enable AI
                  </CardTitle>
                  <CardDescription className="mt-2">
                    EnovAIt uses AI to automatically extract BRSR data from uploaded documents
                    (PDFs, spreadsheets, etc.). Pick your preferred AI provider below and paste your API key.
                  </CardDescription>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ai-provider">AI provider</Label>
                    <select
                      id="ai-provider"
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      value={aiForm.AI_PROVIDER}
                      onChange={(e) => updateAiField('AI_PROVIDER' as keyof AiForm, e.target.value)}
                    >
                      <option value="anthropic">Anthropic (Claude)</option>
                      <option value="openrouter">OpenRouter</option>
                      <option value="openai_compatible">OpenAI compatible</option>
                    </select>
                  </div>

                  {aiForm.AI_PROVIDER === 'anthropic' && (
                    <div className="space-y-3">
                      <div className="rounded-[1.2rem] bg-muted/40 p-4 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">Where to find your API key:</p>
                        <p className="mt-1">
                          Go to{' '}
                          <a
                            href="https://console.anthropic.com/settings/keys"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                          >
                            console.anthropic.com
                            <ExternalLink className="h-3 w-3" />
                          </a>{' '}
                          → <strong>Settings</strong> → <strong>API Keys</strong>. Create a new key and paste it below.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="anthropic-key" className="flex items-center gap-1.5">
                          <Key className="h-3.5 w-3.5 text-muted-foreground" />
                          Anthropic API key
                        </Label>
                        <Input
                          id="anthropic-key"
                          placeholder="sk-ant-..."
                          value={aiForm.ANTHROPIC_API_KEY}
                          onChange={(e) => updateAiField('ANTHROPIC_API_KEY', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {aiForm.AI_PROVIDER === 'openrouter' && (
                    <div className="space-y-3">
                      <div className="rounded-[1.2rem] bg-muted/40 p-4 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">Where to find your API key:</p>
                        <p className="mt-1">
                          Go to{' '}
                          <a
                            href="https://openrouter.ai/keys"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                          >
                            openrouter.ai/keys
                            <ExternalLink className="h-3 w-3" />
                          </a>{' '}
                          → create a new key and paste it below.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="openrouter-key" className="flex items-center gap-1.5">
                          <Key className="h-3.5 w-3.5 text-muted-foreground" />
                          OpenRouter API key
                        </Label>
                        <Input
                          id="openrouter-key"
                          placeholder="sk-or-..."
                          value={aiForm.OPENROUTER_API_KEY}
                          onChange={(e) => updateAiField('OPENROUTER_API_KEY', e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {aiForm.AI_PROVIDER === 'openai_compatible' && (
                    <div className="space-y-3">
                      <div className="rounded-[1.2rem] bg-muted/40 p-4 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">Using an OpenAI-compatible endpoint:</p>
                        <p className="mt-1">
                          Provide your base URL (must end in <code className="rounded bg-muted px-1 py-0.5 text-xs">/v1</code>)
                          and the API key for that service.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="openai-base-url">OpenAI-compatible base URL</Label>
                        <Input
                          id="openai-base-url"
                          placeholder="https://your-endpoint/v1"
                          value={aiForm.OPENAI_BASE_URL}
                          onChange={(e) => updateAiField('OPENAI_BASE_URL', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="openai-key" className="flex items-center gap-1.5">
                          <Key className="h-3.5 w-3.5 text-muted-foreground" />
                          OpenAI-compatible API key
                        </Label>
                        <Input
                          id="openai-key"
                          placeholder="Paste API key"
                          value={aiForm.OPENAI_API_KEY}
                          onChange={(e) => updateAiField('OPENAI_API_KEY', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1"
                    onClick={() => setStep(1)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    size="lg"
                    className="gap-2 rounded-full"
                    disabled={!canProceedStep2 || saveMutation.isPending}
                    onClick={handleCompleteSetup}
                  >
                    {saveMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Globe className="h-4 w-4" />
                        Complete Setup
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: You're ready */}
            {step === 3 && (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>

                <div>
                  <CardTitle className="text-2xl">You&apos;re all set!</CardTitle>
                  <CardDescription className="mt-2 text-base">
                    Your EnovAIt platform is configured and ready to go.
                  </CardDescription>
                </div>

                <div className="rounded-[1.2rem] bg-muted/40 p-4 text-left">
                  <p className="text-sm font-medium text-foreground">What&apos;s configured:</p>
                  <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500" />
                      Supabase connection — {supabaseForm.SUPABASE_URL || 'configured'}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500" />
                      AI provider — {aiForm.AI_PROVIDER}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500" />
                      Authentication keys saved
                    </li>
                  </ul>
                </div>

                <div className="rounded-[1.2rem] bg-amber-50 p-4 text-left text-sm text-amber-800">
                  <p className="font-medium">One last thing</p>
                  <p className="mt-1 text-amber-700">
                    The secrets have been written to the backend <code className="rounded bg-amber-100 px-1 text-xs">.env</code> file.
                    If your backend is already running, restart it so the new values take effect.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="rounded-full"
                    onClick={() => navigate('/secrets')}
                  >
                    View Secrets Page
                  </Button>
                  <Button
                    size="lg"
                    className="gap-2 rounded-full"
                    onClick={() => navigate('/dashboard')}
                  >
                    <Rocket className="h-4 w-4" />
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Need help? Check the{' '}
          <a
            href="https://docs.enovait.example.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            documentation
          </a>
        </p>
      </div>
    </div>
  );
}
