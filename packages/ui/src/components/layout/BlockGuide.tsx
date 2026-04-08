import React from 'react';
import { ArrowRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type GuidePoint = {
  title: string;
  detail: string;
};

interface BlockGuideProps {
  eyebrow?: string;
  title: string;
  description: string;
  points: GuidePoint[];
  ctaLabel?: string;
  onCtaClick?: () => void;
  secondaryLabel?: string;
  onSecondaryClick?: () => void;
}

export function BlockGuide({
  eyebrow = 'Guidance',
  title,
  description,
  points,
  ctaLabel,
  onCtaClick,
  secondaryLabel,
  onSecondaryClick,
}: BlockGuideProps) {
  return (
    <Card className="rounded-[1.8rem] border-white/70 bg-[linear-gradient(180deg,rgba(245,247,244,0.98),rgba(255,255,255,0.97))] shadow-none">
      <CardContent className="p-5 md:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-2xl space-y-3">
            <Badge variant="outline" className="rounded-full border-primary/20 bg-white/90 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-primary">
              {eyebrow}
            </Badge>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-balance">{title}</h2>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">{description}</p>
            </div>
          </div>

          {(ctaLabel || secondaryLabel) && (
            <div className="flex flex-wrap gap-2">
              {secondaryLabel ? (
                <Button variant="outline" className="rounded-full" onClick={onSecondaryClick}>
                  {secondaryLabel}
                </Button>
              ) : null}
              {ctaLabel ? (
                <Button className="rounded-full" onClick={onCtaClick}>
                  {ctaLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : null}
            </div>
          )}
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {points.map((point, index) => (
            <div key={point.title} className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {index + 1}
                </div>
                <p className="text-sm font-medium">{point.title}</p>
              </div>
              <p className="mt-3 text-xs leading-6 text-muted-foreground">{point.detail}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
