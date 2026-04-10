import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileUp,
  Info,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BlockGuide } from '@/components/layout/BlockGuide';
import { BRSRGlossary, InlineGuidance } from '@/components/layout/BRSRGlossary';
import { Progress } from '@/components/ui/progress';
import { brsrReadinessApi, dataApi } from '@/lib/api/endpoints';

export function BRSRReadinessPage() {
  const navigate = useNavigate();

  const { data: readiness, isLoading: readinessLoading } = useQuery({
    queryKey: ['brsr-readiness'],
    queryFn: brsrReadinessApi.getReadiness,
  });

  const { data: sectionDetails } = useQuery({
    queryKey: ['brsr-sections'],
    queryFn: brsrReadinessApi.getSectionDetail,
  });

  const { data: principleDetails } = useQuery({
    queryKey: ['brsr-principles'],
    queryFn: brsrReadinessApi.getPrincipleDetail,
  });

  const { data: gaps } = useQuery({
    queryKey: ['brsr-gaps'],
    queryFn: brsrReadinessApi.getGaps,
  });

  const { data: records = [] } = useQuery({
    queryKey: ['data-records'],
    queryFn: () => dataApi.getRecords({ limit: 200, offset: 0 }).then((result) => result.data),
  });

  const [expandedPrinciple, setExpandedPrinciple] = useState<string | null>(null);

  const brsrRecords = useMemo(
    () =>
      records.filter((record) =>
        record.record_type.startsWith('brsr_') || record.record_type.includes('brsr')
      ),
    [records]
  );

  const isLoading = readinessLoading;

  const principleKey = (principle: string) => principle.toLowerCase().replace(/\s+/g, '');

  const sectionLabels: Record<string, string> = {
    section_a: 'Section A: General Disclosures',
    section_b: 'Section B: Management Process',
    section_c: 'Section C: Principle-wise Performance',
  };

  const latestEvidence = useMemo(
    () =>
      [...brsrRecords]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5),
    [brsrRecords]
  );

  const nextActions = useMemo(() => {
    if (gaps?.recommendedActions?.length) {
      return gaps.recommendedActions.slice(0, 3).map((action) => ({
        title: action,
        description: '',
      }));
    }
    return [
      {
        title: 'Upload BRSR general disclosures',
        description: 'Add PDF board packs, annual report extracts, or policy statements for Section A.',
      },
      {
        title: 'Ingest governance evidence',
        description: 'Bring in policy spreadsheets or management summaries for Section B.',
      },
      {
        title: 'Attach principle-wise documents',
        description: 'Upload spreadsheets and PDFs for principle indicators, assurance, and value-chain coverage.',
      },
    ];
  }, [gaps]);

  return (
    <div className="space-y-6">
      <BlockGuide
        eyebrow="Live readiness"
        title="BRSR readiness is driven by real uploads"
        description="This screen reads live ingestion records, maps them to the three BRSR sections, and shows which evidence is still missing before the filing is ready."
        points={[
          { title: 'Section A', detail: 'Company and general disclosures should arrive first so the filing spine has a base.' },
          { title: 'Section B', detail: 'Policy, governance, and board evidence prove the management layer is active.' },
          { title: 'Section C', detail: 'Principle-wise uploads close the audit gap and keep the report defensible.' },
        ]}
        ctaLabel="Open uploads"
        onCtaClick={() => navigate('/dashboard/data')}
      />

      <Card className="rounded-[1.8rem] border-white/70 bg-[linear-gradient(180deg,rgba(247,248,245,0.98),rgba(255,255,255,0.96))] shadow-none">
        <CardContent className="p-6 md:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                Live readiness
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-balance">BRSR readiness is driven by real uploads</h1>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                This screen reads live ingestion records, maps them to the three BRSR sections, and shows which evidence is still missing
                before the filing is ready.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:w-[390px]">
              <div className="rounded-[1.5rem] bg-white px-4 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Readiness score</p>
                <p className="mt-2 text-3xl font-semibold">{readiness?.overallScore ?? 0}%</p>
                <p className="mt-1 text-xs text-muted-foreground">Based on live ingested evidence</p>
              </div>
              <div className="rounded-[1.5rem] bg-white px-4 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Evidence packs</p>
                <p className="mt-2 text-3xl font-semibold">{readiness?.totalRecords ?? 0}</p>
                <p className="mt-1 text-xs text-muted-foreground">Created by file upload</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="rounded-[1.6rem] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold">Section coverage</p>
                  <p className="text-xs text-muted-foreground">What the ingested evidence currently covers.</p>
                </div>
                <Badge variant="outline" className="rounded-full">{isLoading ? 'Loading...' : 'Live'}</Badge>
              </div>

              <div className="mt-5 space-y-4">
                {(sectionDetails ?? []).map((section) => (
                  <div key={section.section} className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{section.label}</p>
                        <p className="text-xs text-muted-foreground">{section.description}</p>
                      </div>
                      <Badge variant={section.covered ? 'default' : 'secondary'} className="rounded-full">
                        {section.covered ? 'Covered' : 'Missing'}
                      </Badge>
                    </div>
                    <Progress value={section.coveragePercent} className="mt-4" />
                    {section.evidenceKinds.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {section.evidenceKinds.map((kind) => (
                          <Badge key={kind} variant="outline" className="rounded-full text-[10px] capitalize">{kind}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[1.6rem] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-accent p-2 text-primary">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Missing next</p>
                    <p className="text-xs text-muted-foreground">What we should ingest now to move the filing forward.</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {(gaps?.totalGaps ?? 0) === 0 ? (
                    <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
                      <CheckCircle2 className="h-4 w-4" />
                      All core BRSR sections have evidence coverage.
                    </div>
                  ) : (
                    (gaps?.gaps ?? [])
                      .filter((g) => g.type === 'section')
                      .map((gap) => (
                      <div key={gap.section} className="flex items-center justify-between rounded-2xl bg-muted/35 px-3 py-3">
                        <div>
                          <p className="text-sm font-medium">{gap.label}</p>
                          <p className="text-xs text-muted-foreground">{gap.recommendedAction}</p>
                        </div>
                        <FileUp className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-[1.6rem] bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold">Evidence types detected</p>
                <p className="mt-1 text-xs text-muted-foreground">Only based on what users have uploaded.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(readiness?.sourceChannels?.length ?? 0) === 0 ? (
                    <Badge variant="secondary" className="rounded-full">No uploads yet</Badge>
                  ) : (
                    readiness?.sourceChannels?.map((channel) => (
                      <Badge key={channel} variant="secondary" className="rounded-full capitalize">
                        {channel}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Principle-wise coverage */}
      <Card className="rounded-[1.7rem] border-white/70 bg-white/85 shadow-none">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Principle-wise coverage</CardTitle>
            <CardDescription>Track evidence for each of the 9 BRSR principles.</CardDescription>
          </div>
          <BRSRGlossary />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(principleDetails ?? []).map((p) => {
              const key = principleKey(p.principle);
              const isExpanded = expandedPrinciple === key;
              return (
                <div key={p.principle}>
                  <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{p.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          className="h-6 w-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                          onClick={() => setExpandedPrinciple(isExpanded ? null : key)}
                          aria-label="Show guidance"
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                        <Badge variant={p.evidenceCount > 0 ? 'default' : 'secondary'} className="rounded-full">
                          {p.evidenceCount > 0 ? `${p.evidenceCount}` : '—'}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={p.coveragePercent} className="mt-3" />
                    {p.totalEssentialIndicators > 0 && (
                      <p className="mt-2 text-[10px] text-muted-foreground">
                        {p.essentialIndicators}/{p.totalEssentialIndicators} essential, {p.leadershipIndicators}/{p.totalLeadershipIndicators} leadership
                      </p>
                    )}
                    {p.indicatorsExtracted.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {p.indicatorsExtracted.slice(0, 4).map((ind) => (
                          <Badge key={ind} variant="outline" className="rounded-full text-[9px]">{ind.replace(/_/g, ' ')}</Badge>
                        ))}
                        {p.indicatorsExtracted.length > 4 && (
                          <Badge variant="outline" className="rounded-full text-[9px]">+{p.indicatorsExtracted.length - 4} more</Badge>
                        )}
                      </div>
                    )}
                  </div>
                  {isExpanded && <InlineGuidance principleId={key} />}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card className="rounded-[1.7rem] border-white/70 bg-white/85 shadow-none">
          <CardHeader>
            <CardTitle>Latest ingested evidence</CardTitle>
            <CardDescription>Real uploads are the source of truth for the filing workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {latestEvidence.length === 0 ? (
              <div className="flex items-center gap-2 rounded-2xl bg-muted/30 px-4 py-4 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                No BRSR evidence has been ingested yet.
              </div>
            ) : (
              latestEvidence.map((record) => (
                <div key={record.id} className="flex items-center justify-between rounded-2xl bg-muted/35 px-4 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{record.title || record.record_type}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(record.created_at).toLocaleString()} · {record.record_type}
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-full capitalize">{record.status}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[1.7rem] border-white/70 bg-white/85 shadow-none">
          <CardHeader>
            <CardTitle>Next actions</CardTitle>
            <CardDescription>Use these to move from uploaded evidence to filing-ready structure.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextActions.map((action) => (
              <div key={action.title} className="rounded-2xl bg-muted/30 px-4 py-4">
                <p className="text-sm font-medium">{action.title}</p>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">{action.description}</p>
              </div>
            ))}

            <Button className="mt-2 w-full rounded-2xl" onClick={() => navigate('/dashboard/data')}>
              Go to uploads
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
