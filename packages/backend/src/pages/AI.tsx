import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const suggestions = [
  "Summarize the latest readiness gaps.",
  "What evidence is missing for BRSR Core?",
  "Draft a narrative for water consumption variance.",
];

function generateReply(prompt: string) {
  const lower = prompt.toLowerCase();

  if (lower.includes("water")) {
    return "Water variance is flagged in one facility. I would request meter validation, source notes, and a short reviewer explanation before sign-off.";
  }

  if (lower.includes("brsr") || lower.includes("readiness")) {
    return "Current readiness is strong, but the highest-value follow-up is closing the remaining emissions and energy evidence gaps.";
  }

  if (lower.includes("narrative")) {
    return "Use a concise structure: what changed, why it changed, how it was verified, and what action is already in flight.";
  }

  return "I can help turn the current workspace data into a clear summary, reviewer note, or filing narrative.";
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "I am the EnovAIt workspace assistant. Ask for a summary, a narrative draft, or a readiness check.",
    },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setInput("");

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        { role: "assistant", content: generateReply(trimmed) },
      ]);
    }, 350);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            AI assistant
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Workspace copiloting
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
            A lightweight, live chat surface for drafting summaries and surfacing the next best action.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Context aware
        </div>
      </div>

      <Card className="overflow-hidden border-white/60 bg-white/80 shadow-sm">
        <CardHeader className="border-b border-border/60">
          <CardTitle className="text-xl tracking-tight">Conversation</CardTitle>
          <CardDescription>
            Ask for a summary, a gap analysis, or a drafting prompt.
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
              placeholder="Ask about evidence, narratives, or readiness..."
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
    </div>
  );
}
