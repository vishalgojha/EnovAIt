import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Mail, Copy, Check } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BlockGuide } from '@/components/layout/BlockGuide';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  principle: string;
  category: string;
}

const principleColors: Record<string, string> = {
  P1: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  P2: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  P3: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  P4: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  P5: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  P6: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  P7: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  P8: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  P9: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
};

function getPrincipleColor(principle: string): string {
  return principleColors[principle] ?? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
}

function TemplateCard({ template }: { template: EmailTemplate }) {
  const [copiedSubject, setCopiedSubject] = React.useState(false);
  const [copiedBody, setCopiedBody] = React.useState(false);

  const copyToClipboard = async (text: string, type: 'subject' | 'body') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'subject') {
        setCopiedSubject(true);
        toast.success('Subject copied to clipboard');
        setTimeout(() => setCopiedSubject(false), 2000);
      } else {
        setCopiedBody(true);
        toast.success('Body copied to clipboard');
        setTimeout(() => setCopiedBody(false), 2000);
      }
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Card className="group hover:border-primary transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
            <Mail className="h-4 w-4" />
          </div>
          <Badge className={cn('text-xs', getPrincipleColor(template.principle))}>
            {template.principle}
          </Badge>
        </div>
        <CardTitle className="text-base mt-2">{template.name}</CardTitle>
        <CardDescription className="text-xs uppercase font-semibold">{template.category}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Subject</p>
          <div className="bg-muted/50 rounded p-2 text-xs font-mono text-muted-foreground line-clamp-2">
            {template.subject}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">Body</p>
          <div className="bg-muted/50 rounded p-2 text-xs font-mono text-muted-foreground line-clamp-4 whitespace-pre-line min-h-[60px]">
            {template.body}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => copyToClipboard(template.subject, 'subject')}
        >
          {copiedSubject ? (
            <>
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Copy Subject
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          onClick={() => copyToClipboard(template.body, 'body')}
        >
          {copiedBody ? (
            <>
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="mr-1.5 h-3.5 w-3.5" />
              Copy Body
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export function EmailTemplatesPage() {
  const {
    data: templates = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['email-intake-templates'],
    queryFn: async () => {
      const response = await fetch('/api/v1/email-intake/templates');
      if (!response.ok) {
        throw new Error('Failed to fetch email templates');
      }
      const json = await response.json();
      return json.data as EmailTemplate[];
    },
  });

  return (
    <div className="space-y-6">
      <BlockGuide
        eyebrow="Email Templates"
        title="Pre-written email templates for BRSR evidence submission"
        description="Copy a template, fill in the placeholders, and send it to your intake email. The AI will classify and ingest the response automatically."
        points={[
          { title: 'Pick a template', detail: 'Choose the template that matches the evidence you need to collect.' },
          { title: 'Fill in placeholders', detail: 'Replace {placeholders} with your actual facility or department data.' },
          { title: 'Send to intake', detail: 'Email the completed template to your configured intake address.' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-muted-foreground">Copy-paste templates for submitting BRSR evidence via email.</p>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-sm text-muted-foreground">Loading email templates...</CardContent>
        </Card>
      ) : isError ? (
        <Card>
          <CardContent className="p-8 space-y-2">
            <p className="text-sm text-destructive">Failed to load email templates.</p>
            <p className="text-xs text-muted-foreground">
              {error instanceof Error ? error.message : 'Please retry.'}
            </p>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  );
}
