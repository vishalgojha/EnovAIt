import React from 'react';
import { 
  Send, 
  Terminal, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Code,
  Play,
  Copy,
  CheckCircle2,
  RefreshCw
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { channelApi } from '@/lib/api/endpoints';
import { toast } from 'sonner';

export function ChannelsConsolePage() {
  const [selectedChannel, setSelectedChannel] = React.useState('whatsapp_official');
  const [testPayload, setTestPayload] = React.useState(JSON.stringify({
    event: 'message.received',
    timestamp: new Date().toISOString(),
    data: {
      from: '+1234567890',
      text: 'Hello EnovAIt!',
      media: null
    }
  }, null, 2));

  const [sending, setSending] = React.useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await channelApi.sendMessage({
        channel: selectedChannel,
        to: '+1234567890',
        content: { text: 'Test message from EnovAIt Console' }
      });
      toast.success('Test message sent successfully');
    } catch (error) {
      toast.error('Failed to send test message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Channels Console</h1>
          <p className="text-muted-foreground">Monitor channel health and simulate incoming webhooks.</p>
        </div>
        <Badge variant="outline" className="h-8 px-4 gap-2">
          <Activity className="h-3 w-3 text-green-500" />
          System Status: Operational
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="simulator">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="simulator">Webhook Simulator</TabsTrigger>
              <TabsTrigger value="test-send">Send Test Message</TabsTrigger>
            </TabsList>
            
            <TabsContent value="simulator" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    Payload Simulator
                  </CardTitle>
                  <CardDescription>
                    Simulate an incoming webhook from a provider to test your workflow rules.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Target Channel</Label>
                      <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select channel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="whatsapp_official">WhatsApp Official</SelectItem>
                          <SelectItem value="slack">Slack</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="sms">SMS Gateway</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Event Type</Label>
                      <Select defaultValue="message.received">
                        <SelectTrigger>
                          <SelectValue placeholder="Select event" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="message.received">Message Received</SelectItem>
                          <SelectItem value="message.delivered">Message Delivered</SelectItem>
                          <SelectItem value="user.subscribed">User Subscribed</SelectItem>
                          <SelectItem value="payment.success">Payment Success</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>JSON Payload</Label>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => {
                        navigator.clipboard.writeText(testPayload);
                        toast.success('Payload copied to clipboard');
                      }}>
                        <Copy className="mr-2 h-3 w-3" />
                        Copy
                      </Button>
                    </div>
                    <Textarea 
                      className="font-mono text-xs min-h-[250px] bg-muted/50"
                      value={testPayload}
                      onChange={(e) => setTestPayload(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter className="justify-between border-t bg-muted/20 p-4">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Payload will be routed through the tenant's sandbox.
                  </p>
                  <Button onClick={() => toast.success('Simulation started')}>
                    <Play className="mr-2 h-4 w-4" />
                    Run Simulation
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="test-send" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Outbound Test
                  </CardTitle>
                  <CardDescription>
                    Send a real message through a configured channel to verify connectivity.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSendMessage}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Recipient (Phone/Email/ID)</Label>
                      <Input placeholder="+1234567890" required />
                    </div>
                    <div className="space-y-2">
                      <Label>Message Content</Label>
                      <Textarea placeholder="Type your test message here..." required />
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/20 p-4">
                    <Button type="submit" disabled={sending} className="w-full">
                      {sending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Test Message
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Channel Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { name: 'WhatsApp', health: 98, status: 'Healthy' },
                { name: 'Slack', health: 100, status: 'Healthy' },
                { name: 'Email', health: 85, status: 'Degraded' },
                { name: 'SMS', health: 95, status: 'Healthy' },
              ].map((channel) => (
                <div key={channel.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{channel.name}</span>
                    <span className={cn(
                      "text-xs",
                      channel.health > 90 ? "text-green-500" : "text-amber-500"
                    )}>{channel.status} ({channel.health}%)</span>
                  </div>
                  <Progress value={channel.health} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Live Traffic</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 text-xs border-b pb-3 last:border-0 last:pb-0">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Code className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">POST</span>
                        <span className="text-muted-foreground">/webhooks/whatsapp</span>
                      </div>
                      <span className="text-muted-foreground font-mono">200 OK • 45ms</span>
                      <span className="text-[10px] text-muted-foreground">Just now</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-xs" size="sm">
                View Full Logs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { cn } from '@/lib/utils';
