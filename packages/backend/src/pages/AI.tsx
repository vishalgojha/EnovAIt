import { useEffect, useRef, useState } from "react";
import { Bot, Send, ShieldCheck, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const suggestions = [
  "Who can approve a new team admin?",
  "Give me a quick summary of current access issues.",
  "What should I check before giving someone view-only access?",
];

function generateReply(prompt: string) {
  const lower = prompt.toLowerCase();

  if (lower.includes("admin")) {
    return "Admin access should require an owner or super admin approval, a clear business reason, and an audit trail entry before activation.";
  }

  if (lower.includes("viewer")) {
    return "Viewer access is lowest risk, but it should still be time-bound when it is tied to project work or external review.";
  }

  if (lower.includes("risk")) {
    return "The biggest RBAC risk is privilege drift. Review stale admin accounts, missing approvers, and roles that grew beyond their original scope.";
  }

  return "I can help draft role requests, explain approval rules, and summarize who can see which part of the workspace.";
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi, I am AI Chat. I can explain who can do what, help with requests, and point out what needs attention.",
    },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }

    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setInput("");

    window.setTimeout(() => {
      setMessages((current) => [...current, { role: "assistant", content: generateReply(trimmed) }]);
    }, 300);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            AI Chat
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Ask a question in plain language
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
            Use AI Chat to understand roles, requests, and next steps without digging through every page yourself.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Ready to help
        </div>
      </div>

      <Card className="overflow-hidden border-white/60 bg-white/80 shadow-sm">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="text-xl tracking-tight">Chat</CardTitle>
          <CardDescription>
            Ask who can do something, why a request is waiting, or what to review next.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 p-5">
          <div className="space-y-4 rounded-3xl border border-border/60 bg-muted/20 p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  "flex items-start gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#101513] text-white">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-3xl px-4 py-3 text-sm leading-7",
                    message.role === "user"
                      ? "rounded-tr-md bg-[#101513] text-white"
                      : "rounded-tl-md border border-border/60 bg-white text-foreground shadow-sm"
                  )}
                >
                  {message.content}
                </div>
                {message.role === "user" && (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          <div className="grid gap-2 md:grid-cols-3">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => send(item)}
                className="rounded-2xl border border-border/60 bg-white px-4 py-3 text-left text-sm leading-6 text-muted-foreground transition-colors hover:border-primary/20 hover:bg-primary/5 hover:text-foreground"
              >
                {item}
              </button>
            ))}
          </div>

          <div className="relative">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  send(input);
                }
              }}
              placeholder="Ask about people, requests, or next steps..."
              className="h-12 rounded-full border-white/10 bg-white/80 pl-4 pr-28 shadow-sm"
            />
            <Button
              onClick={() => send(input)}
              className="absolute right-1 top-1 h-10 rounded-full bg-[#101513] px-4 text-white hover:bg-[#101513]/90"
            >
              <Send className="mr-2 h-4 w-4" />
              Ask
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          "Owner approval for high-access changes",
          "Manager review for sensitive requests",
          "View-only access for read-only work",
        ].map((item) => (
          <Card key={item} className="border-white/60 bg-white/80 shadow-sm">
            <CardContent className="flex items-center gap-3 p-5">
              <ShieldCheck className="h-4 w-4 text-[#4A6741]" />
              <p className="text-sm leading-6 text-muted-foreground">{item}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
