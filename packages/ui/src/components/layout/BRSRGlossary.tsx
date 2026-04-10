import { BookOpen, HelpCircle, Info } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  sectionGuidance,
  principleGuidance,
  type GuidanceItem,
} from "@/lib/brsrGuidance";

function GuidanceCard({ item }: { item: GuidanceItem }) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-3 space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold leading-tight">{item.title}</h4>
        <Badge variant="outline" className="rounded-full text-[10px] shrink-0">
          {item.id.replace("_", " ").toUpperCase()}
        </Badge>
      </div>

      <div className="space-y-2 text-xs leading-relaxed">
        <div>
          <p className="font-medium text-foreground">What it is</p>
          <p className="text-muted-foreground">{item.whatItIs}</p>
        </div>
        <div>
          <p className="font-medium text-foreground">What to submit</p>
          <p className="text-muted-foreground">{item.whatToSubmit}</p>
        </div>
        <div>
          <p className="font-medium text-foreground">Who sends it</p>
          <p className="text-muted-foreground">{item.whoSendsIt}</p>
        </div>
      </div>
    </div>
  );
}

function GuidanceList({ items }: { items: GuidanceItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <GuidanceCard key={item.id} item={item} />
      ))}
    </div>
  );
}

export function BRSRGlossary() {
  const [open, setOpen] = useState(false);

  const sections = Object.values(sectionGuidance);
  const principles = Object.values(principleGuidance);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          aria-label="BRSR glossary"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[420px] p-0" sideOffset={8}>
        <Tabs defaultValue="sections" className="w-full">
          <div className="border-b border-border/50 px-3 pt-3">
            <div className="flex items-center gap-2 pb-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">BRSR Guidance</span>
            </div>
            <TabsList className="w-full">
              <TabsTrigger value="sections" className="flex-1">Sections</TabsTrigger>
              <TabsTrigger value="principles" className="flex-1">Principles</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[380px]">
            <div className="p-3 pt-3 space-y-3">
              <TabsContent value="sections">
                <GuidanceList items={sections} />
              </TabsContent>
              <TabsContent value="principles">
                <GuidanceList items={principles} />
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}

export function InlineGuidance({ principleId }: { principleId: string }) {
  const item = principleGuidance[principleId];
  if (!item) return null;

  return (
    <div className="mt-3 rounded-xl border border-dashed border-primary/30 bg-primary/[0.04] px-3.5 py-3 text-xs leading-relaxed">
      <div className="flex items-start gap-2">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <div className="space-y-2">
          <p className="font-semibold text-foreground">{item.title}</p>
          <div>
            <span className="font-medium">What it is: </span>
            <span className="text-muted-foreground">{item.whatItIs}</span>
          </div>
          <div>
            <span className="font-medium">What to submit: </span>
            <span className="text-muted-foreground">{item.whatToSubmit}</span>
          </div>
          <div>
            <span className="font-medium">Who sends it: </span>
            <span className="text-muted-foreground">{item.whoSendsIt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
