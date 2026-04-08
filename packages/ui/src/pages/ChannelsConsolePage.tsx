import React from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Activity, CheckCircle2, RefreshCw, Send, Terminal, XCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { channelApi } from '@/lib/api/endpoints';
import { BlockGuide } from '@/components/layout/BlockGuide';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type ChannelOption = {
  value: string;
  label: string;
};

type ActivityItem = {
  at: string;
  channel: string;
  accepted: boolean;
  detail: string;
  externalId: string | null;
};

const channelOptions: ChannelOption[] = [
  { value: 'whatsapp_evolution', label: 'WhatsApp Evolution' },
  { value: 'whatsapp_official', label: 'WhatsApp Official' },
  { value: 'whatsapp_baileys', label: 'WhatsApp Baileys' },
  { value: 'slack', label: 'Slack' },
  { value: 'msteams', label: 'Microsoft Teams' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
];

const toHealthScore = (healthy: boolean, configured: boolean): number => {
  if (!configured) {
    return 20;
  }
  return healthy ? 100 : 45;
};

const toHealthLabel = (healthy: boolean, configured: boolean): string => {
  if (!configured) {
    return 'Not configured';
  }
  return healthy ? 'Healthy' : 'Degraded';
};

export function ChannelsConsolePage() {
  const [selectedChannel, setSelectedChannel] = React.useState(channelOptions[0]?.value ?? 'whatsapp_evolution');
  const [recipient, setRecipient] = React.useState('');
  const [message, setMessage] = React.useState('Test message from EnovAIt Console');
  const [recentActivity, setRecentActivity] = React.useState<ActivityItem[]>([]);

  const {
    data: channelStatuses = [],
    isLoading: isStatusesLoading,
    refetch: refetchStatuses,
    isFetching: isStatusesRefreshing,
  } = useQuery({
    queryKey: ['channel-statuses'],
    queryFn: async () => {
      const statuses = await Promise.all(
        channelOptions.map(async (channel) => {
          try {
            const status = await channelApi.getStatus(channel.value);
            return {
              ...status,
              label: channel.label,
            };
          } catch {
            return {
              channel: channel.value,
              label: channel.label,
              configured: false,
              healthy: false,
              detail: 'status check failed',
            };
          }
        })
      );

      return statuses;
    },
    refetchInterval: 30_000,
  });

  const sendMutation = useMutation({
    mutationFn: () =>
      channelApi.sendMessage({
        channel: selectedChannel,
        to: recipient.trim() || undefined,
        message: message.trim(),
      }),
    onSuccess: (result) => {
      toast.success('Message request accepted');
      setRecentActivity((previous) => [
        {
          at: result.sent_at,
          channel: result.channel,
          accepted: result.accepted,
          detail: result.detail,
          externalId: result.external_id,
        },
        ...previous,
      ].slice(0, 8));
    },
    onError: (error: unknown) => {
      const messageText =
        typeof error === 'object' &&
        error &&
        'response' in error &&
        typeof (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message === 'string'
          ? (error as { response?: { data?: { error?: { message?: string } } } }).response?.data?.error?.message
          : 'Failed to send message';
      toast.error(messageText);
    },
  });

  const handleSendMessage = (event: React.FormEvent) => {
    event.preventDefault();

    if (!message.trim()) {
      toast.error('Message is required');
      return;
    }

    sendMutation.mutate();
  };

  const healthyCount = channelStatuses.filter((status) => status.configured && status.healthy).length;

  return (
    <div className="space-y-6">
      <BlockGuide
        eyebrow="Channels"
        title="Watch the intake channels that already power the evidence pipeline"
        description="The console should make it obvious which channels are healthy, what messages were accepted, and where the team should intervene next."
        points={[
          { title: 'Check health', detail: 'Use the score to spot channels that need attention before data stops flowing.' },
          { title: 'Send a test', detail: 'Test messages should always use the real provider path, not a fake stub.' },
          { title: 'Track activity', detail: 'Recent sends give operators a quick audit trail for outbound communication.' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Channels Console</h1>
          <p className="text-muted-foreground">Monitor channel health and send real test messages.</p>
        </div>
        <Badge variant="outline" className="h-8 px-4 gap-2">
          <Activity className={cn('h-3 w-3', healthyCount > 0 ? 'text-green-500' : 'text-amber-500')} />
          {healthyCount > 0 ? `${healthyCount} healthy channels` : 'No healthy channels'}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                Send Test Message
              </CardTitle>
              <CardDescription>
                This calls the real channel dispatch endpoint for your selected provider.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSendMessage}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Channel</Label>
                    <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select channel" />
                      </SelectTrigger>
                      <SelectContent>
                        {channelOptions.map((channel) => (
                          <SelectItem key={channel.value} value={channel.value}>
                            {channel.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Recipient</Label>
                    <Input
                      value={recipient}
                      onChange={(event) => setRecipient(event.target.value)}
                      placeholder="+919999999999 or name@company.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Message Content</Label>
                  <Textarea
                    placeholder="Type your test message..."
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t bg-muted/20 p-4">
                <Button type="submit" disabled={sendMutation.isPending} className="w-full">
                  {sendMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Channel Health</CardTitle>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => refetchStatuses()}>
                  <RefreshCw className={cn('mr-1 h-3 w-3', isStatusesRefreshing && 'animate-spin')} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {isStatusesLoading ? (
                <p className="text-sm text-muted-foreground">Loading channel statuses...</p>
              ) : (
                channelStatuses.map((channel) => {
                  const healthValue = toHealthScore(channel.healthy, channel.configured);
                  const healthLabel = toHealthLabel(channel.healthy, channel.configured);
                  const statusClassName =
                    channel.configured && channel.healthy ? 'text-green-500' : 'text-amber-500';

                  return (
                    <div key={channel.channel} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{channel.label}</span>
                        <span className={cn('text-xs', statusClassName)}>
                          {healthLabel} ({healthValue}%)
                        </span>
                      </div>
                      <Progress value={healthValue} className="h-1.5" />
                      <p className="text-[10px] text-muted-foreground">{channel.detail}</p>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.length === 0 ? (
                <p className="text-xs text-muted-foreground">No outbound activity in this session yet.</p>
              ) : (
                recentActivity.map((activity) => (
                  <div key={`${activity.channel}-${activity.at}-${activity.externalId ?? 'none'}`} className="rounded-md border p-3">
                    <div className="flex items-center gap-2 text-xs">
                      {activity.accepted ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-destructive" />
                      )}
                      <span className="font-mono">{activity.channel}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{activity.detail}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(activity.at).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
