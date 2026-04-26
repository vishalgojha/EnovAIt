import React from 'react';
import { 
  Send, 
  Terminal, 
  Activity, 
  ShieldCheck, 
  CheckCircle2,
  Play,
  Copy,
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
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function ChannelsConsolePage() {
  const [selectedChannel, setSelectedChannel] = React.useState('whatsapp_official');
  const [recipient, setRecipient] = React.useState('');
  const [message, setMessage] = React.useState('Test message from EnovAIt Console');
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

  const handleValidatePayload = () => {
    try {
      JSON.parse(testPayload);
      toast.success('This example looks good');
    } catch {
      toast.error('Something in this example needs fixing');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await channelApi.sendMessage({
        channel: selectedChannel,
        to: recipient,
        message,
      });
      toast.success('Message sent for delivery');
    } catch (error) {
      toast.error("Couldn't send the message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages & Connections</h1>
          <p className="text-muted-foreground">
            Check which services are working, preview an incoming update, or send a quick test message.
          </p>
        </div>
        <Badge variant="outline" className="h-8 px-4 gap-2">
          <Activity className="h-3 w-3 text-green-500" />
          Messaging services are available
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="simulator">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="simulator">Preview Incoming Message</TabsTrigger>
              <TabsTrigger value="test-send">Send Sample Message</TabsTrigger>
            </TabsList>
            
            <TabsContent value="simulator" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    Incoming Message Preview
                  </CardTitle>
                  <CardDescription>
                    Review a sample message before you connect a live service.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Service</Label>
                      <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="whatsapp_official">WhatsApp Business</SelectItem>
                          <SelectItem value="slack">Slack</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Update Type</Label>
                      <Select defaultValue="message.received">
                        <SelectTrigger>
                          <SelectValue placeholder="Choose update type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="message.received">New message received</SelectItem>
                          <SelectItem value="message.delivered">Message delivered</SelectItem>
                          <SelectItem value="user.subscribed">New contact added</SelectItem>
                          <SelectItem value="payment.success">Payment confirmed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Message Example</Label>
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => {
                        navigator.clipboard.writeText(testPayload);
                        toast.success('Example copied');
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
                    This check stays on this screen and does not contact an outside service.
                  </p>
                  <Button onClick={handleValidatePayload}>
                    <Play className="mr-2 h-4 w-4" />
                    Check Example
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="test-send" className="space-y-4 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="h-5 w-5" />
                    Send a Sample Message
                  </CardTitle>
                  <CardDescription>
                    Send a real message through one of your connected services to make sure it arrives.
                  </CardDescription>
                </CardHeader>
                <form onSubmit={handleSendMessage}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Send To</Label>
                      <Input
                        placeholder="Enter a phone number, email, or contact ID"
                        required
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Message</Label>
                      <Textarea
                        placeholder="Write the message you want to send..."
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/20 p-4">
                    <Button type="submit" disabled={sending} className="w-full">
                      {sending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Sending message...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Sample Message
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
              <CardTitle className="text-sm font-medium">Connected Services</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { name: 'WhatsApp', health: 98, status: 'Working well' },
                { name: 'Slack', health: 100, status: 'Working well' },
                { name: 'Email', health: 85, status: 'Needs attention' },
                { name: 'SMS', health: 95, status: 'Working well' },
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
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: 'WhatsApp message received',
                    detail: 'Added to your incoming message flow',
                    time: 'Just now',
                  },
                  {
                    title: 'Slack alert delivered',
                    detail: 'Sent successfully to your workspace',
                    time: '2 minutes ago',
                  },
                  {
                    title: 'Email update sent',
                    detail: 'Delivered to the selected reviewer',
                    time: '5 minutes ago',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 text-xs border-b pb-3 last:border-0 last:pb-0">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-muted-foreground">{item.detail}</span>
                      <span className="text-[10px] text-muted-foreground">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-xs" size="sm" disabled>
                View Activity History
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
