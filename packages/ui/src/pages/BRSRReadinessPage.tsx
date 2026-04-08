import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileUp,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BlockGuide } from '@/components/layout/BlockGuide';
import { Progress } from '@/components/ui/progress';
import { adminApi, dataApi } from '@/lib/api/endpoints';

const sectionLabels: Record<string, string> = {
  section_a_general_disclosures: 'Section A',
  section_b_management_process: 'Section B',
  section_c_principle_wise_performance: 'Section C',
};

const inferCoverage = (recordType: string, data: Record<string, unknown>) => {
  const text = JSON.stringify({ recordType, ...data }).toLowerCase();

  const hasGeneralDisclosures = text.includes('section a') || text.includes('general') || text.includes('corporate') || text.includes('entity');
  const hasManagementDisclosures = text.includes('policy') || text.includes('governance') || text.includes('board');
  const hasPrincipleEvidence = text.includes('principle') || text.includes('value chain') || text.includes('assurance') || text.includes('indicator');

  return {
    section_a_general_disclosures: hasGeneralDisclosures,
    section_b_management_process: hasManagementDisclosures,
    section_c_principle_wise_performance: hasPrincipleEvidence,
  };
};

export function BRSRReadinessPage() {
  const navigate = useNavigate();

  const { data: modules = [] } = useQuery({
    queryKey: ['admin-modules'],
    queryFn: adminApi.getModules,
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['data-records'],
    queryFn: () => dataApi.getRecords({ limit: 200, offset: 0 }).then((result) => result.data),
  });

  const brsrModule = useMemo(
    () =>
      modules.find((module) => module.code === 'brsr_india') ||
      modules.find((module) => module.name.toLowerCase().includes('brsr')) ||
      modules[0],
    [modules]
  );

  const brsrRecords = useMemo(
    () =>
      records.filter((record) => {
        if (!brsrModule) {
          return false;
        }
        return record.module_id === brsrModule.id || record.record_type.startsWith('brsr_');
      }),
    [brsrModule, records]
  );

  const readiness = useMemo(() => {
    const requiredSections = [
      'section_a_general_disclosures',
      'section_b_management_process',
      'section_c_principle_wise_performance',
    ];

    const coverage = requiredSections.reduce<Record<string, boolean>>((accumulator, section) => {
      accumulator[section] = false;
      return accumulator;
    }, {});

    const evidenceKinds = new Set<string>();

    for (const record of brsrRecords) {
      const recordData = (record.data ?? {}) as Record<string, unknown>;
      const inferred = inferCoverage(record.record_type, recordData);

      for (const [section, covered] of Object.entries(inferred)) {
        coverage[section] = coverage[section] || covered;
      }

      const kind = typeof recordData.kind === 'string' ? recordData.kind : null;
      if (kind) {
        evidenceKinds.add(kind);
      }
    }

    const coveredSections = requiredSections.filter((section) => coverage[section]).length;
    const score = Math.round((coveredSections / requiredSections.length) * 100);

    const gaps = requiredSections.filter((section) => !coverage[section]);

    return {
      score,
      coverage,
      gaps,
      evidenceKinds: [...evidenceKinds],
    };
  }, [brsrRecords]);

  const latestEvidence = useMemo(
    () =>
      [...brsrRecords]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5),
    [brsrRecords]
  );

  const nextActions = [
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
                <p className="mt-2 text-3xl font-semibold">{readiness.score}%</p>
                <p className="mt-1 text-xs text-muted-foreground">Based on live ingested evidence</p>
              </div>
              <div className="rounded-[1.5rem] bg-white px-4 py-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Evidence packs</p>
                <p className="mt-2 text-3xl font-semibold">{brsrRecords.length}</p>
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
                {Object.entries(sectionLabels).map(([sectionKey, label]) => {
                  const covered = readiness.coverage[sectionKey];
                  return (
                    <div key={sectionKey} className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium">{label}</p>
                          <p className="text-xs text-muted-foreground">
                            {sectionKey === 'section_a_general_disclosures' && 'Listed entity details, operations, and material issues'}
                            {sectionKey === 'section_b_management_process' && 'Policies, board oversight, and management disclosures'}
                            {sectionKey === 'section_c_principle_wise_performance' && 'Principle-wise performance, indicators, and assurance'}
                          </p>
                        </div>
                        <Badge variant={covered ? 'default' : 'secondary'} className="rounded-full">
                          {covered ? 'Covered' : 'Missing'}
                        </Badge>
                      </div>
                      <Progress value={covered ? 100 : 18} className="mt-4" />
                    </div>
                  );
                })}
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
                  {readiness.gaps.length === 0 ? (
                    <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
                      <CheckCircle2 className="h-4 w-4" />
                      All core BRSR sections have evidence coverage.
                    </div>
                  ) : (
                    readiness.gaps.map((gap) => (
                      <div key={gap} className="flex items-center justify-between rounded-2xl bg-muted/35 px-3 py-3">
                        <div>
                          <p className="text-sm font-medium">{sectionLabels[gap]}</p>
                          <p className="text-xs text-muted-foreground">
                            Upload live evidence to cover this section.
                          </p>
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
                  {readiness.evidenceKinds.length === 0 ? (
                    <Badge variant="secondary" className="rounded-full">No uploads yet</Badge>
                  ) : (
                    readiness.evidenceKinds.map((kind) => (
                      <Badge key={kind} variant="secondary" className="rounded-full capitalize">
                        {kind}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </div>
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
