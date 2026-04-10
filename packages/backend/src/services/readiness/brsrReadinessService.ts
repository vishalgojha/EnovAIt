import type { SupabaseClient } from "@supabase/supabase-js";

import { AppError } from "../../lib/errors.js";
import { brsrIndicatorRegistry } from "../extraction/brsrIndicatorSchema.js";

interface SectionCoverage {
  section: string;
  label: string;
  description: string;
  covered: boolean;
  evidenceCount: number;
  latestEvidenceAt: string | null;
  evidenceKinds: string[];
}

interface ReadinessSummary {
  overallScore: number;
  sectionCoverage: SectionCoverage[];
  totalEvidence: number;
  totalRecords: number;
  sourceChannels: string[];
  lastIngestedAt: string | null;
  readinessLevel: "not_started" | "early" | "in_progress" | "almost_ready" | "ready";
}

interface SectionDetail {
  section: string;
  label: string;
  description: string;
  coveragePercent: number;
  evidenceCount: number;
  evidenceKinds: string[];
  records: Array<{
    id: string;
    title: string;
    recordType: string;
    sourceChannel: string;
    createdAt: string;
    status: string;
  }>;
}

interface PrincipleDetail {
  principle: number;
  title: string;
  description: string;
  coveragePercent: number;
  evidenceCount: number;
  essentialIndicators: number;
  leadershipIndicators: number;
  totalEssentialIndicators: number;
  totalLeadershipIndicators: number;
  indicatorsExtracted: string[];
  latestEvidenceAt: string | null;
  records: Array<{
    id: string;
    title: string;
    recordType: string;
    sourceChannel: string;
    createdAt: string;
    status: string;
  }>;
}

interface GapItem {
  section: string;
  label: string;
  type: "section" | "principle" | "assurance" | "value_chain";
  severity: "low" | "medium" | "high";
  description: string;
  recommendedAction: string;
}

interface GapsSummary {
  gaps: GapItem[];
  totalGaps: number;
  criticalGaps: number;
  recommendedActions: string[];
}

const SECTION_LABELS: Record<string, string> = {
  section_a: "Section A: General Disclosures",
  section_b: "Section B: Management Process",
  section_c: "Section C: Principle-wise Performance",
};

const SECTION_DESCRIPTIONS: Record<string, string> = {
  section_a: "Listed entity details, operations, workforce, CSR, complaints, and material issues",
  section_b: "Policy and management process disclosures across Principles 1-9",
  section_c: "Principle-wise performance with Essential and Leadership indicators",
};

const PRINCIPLE_TITLES: Record<number, string> = {
  1: "P1: Ethics, Transparency and Accountability",
  2: "P2: Sustainable Goods and Services",
  3: "P3: Employee Well-being",
  4: "P4: Stakeholder Engagement",
  5: "P5: Human Rights",
  6: "P6: Environmental Protection",
  7: "P7: Policy Advocacy",
  8: "P8: Inclusive Growth",
  9: "P9: Consumer Value",
};

const PRINCIPLE_DESCRIPTIONS: Record<number, string> = {
  1: "Business conduct with integrity, ethics, and transparent governance",
  2: "Sustainable design and sourcing of products and services",
  3: "Employee well-being, diversity, health, and safety",
  4: "Engagement with all stakeholders, especially disadvantaged groups",
  5: "Respect for human rights across operations and value chain",
  6: "Protection and restoration of the environment, emissions, waste, water",
  7: "Responsible influence on government and public policy",
  8: "Inclusive growth, livelihoods, and community development",
  9: "Fair value delivery to consumers, data privacy, and responsible marketing",
};

const inferSectionCoverage = (recordType: string, data: Record<string, unknown>): Set<string> => {
  const covered = new Set<string>();
  const text = JSON.stringify({ recordType, ...data }).toLowerCase();

  // Section A indicators
  if (
    recordType.includes("section_a") ||
    text.includes("listed entity") ||
    text.includes("corporate") ||
    text.includes("entity name") ||
    text.includes("reporting boundary") ||
    text.includes("general disclosure") ||
    text.includes("cin") ||
    text.includes("financial year") ||
    text.includes("incorporation") ||
    text.includes("workforce") ||
    text.includes("material issue")
  ) {
    covered.add("section_a");
  }

  // Section B indicators
  if (
    recordType.includes("section_b") ||
    text.includes("policy") ||
    text.includes("governance") ||
    text.includes("board approved") ||
    text.includes("management disclosure") ||
    text.includes("principle_policies") ||
    text.includes("governance_oversight")
  ) {
    covered.add("section_b");
  }

  // Section C indicators
  if (
    recordType.includes("section_c") ||
    recordType.includes("principle_") ||
    text.includes("principle-wise") ||
    text.includes("essential indicator") ||
    text.includes("leadership indicator") ||
    text.includes("principle_number") ||
    text.includes("principle_title") ||
    text.includes("assurance") ||
    text.includes("value chain")
  ) {
    covered.add("section_c");
  }

  return covered;
};

const inferPrincipleCoverage = (recordType: string, data: Record<string, unknown>): Set<number> => {
  const covered = new Set<number>();
  const text = JSON.stringify({ recordType, ...data }).toLowerCase();

  for (let p = 1; p <= 9; p++) {
    if (
      recordType.includes(`principle_${p}`) ||
      text.includes(`principle ${p}`) ||
      text.includes(`p${p}`)
    ) {
      covered.add(p);
    }
  }

  // Generic principle coverage detection
  if (text.includes("principle") && covered.size === 0) {
    for (let p = 1; p <= 9; p++) {
      if (text.includes(PRINCIPLE_TITLES[p].toLowerCase().split(":")[1].toLowerCase().trim())) {
        covered.add(p);
      }
    }
  }

  return covered;
};

export const brsrReadinessService = {
  async computeReadiness(supabase: SupabaseClient, orgId: string): Promise<ReadinessSummary> {
    const { data: records, error } = await supabase
      .from("data_records")
      .select("id, record_type, data, source_channel, created_at, status")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError("Failed to fetch data records", 500, "DB_READ_FAILED", error);
    }

    const brsrRecords = (records ?? []).filter(
      (r) =>
        r.record_type.startsWith("brsr_") ||
        r.record_type.includes("brsr") ||
        (r.data as Record<string, unknown> | null)?.record_type?.toString().includes("brsr")
    );

    // Track indicator-level coverage
    const indicatorsByPrinciple: Record<string, Set<string>> = {};
    const totalIndicatorsByPrinciple: Record<string, number> = {};

    // Initialize from registry
    for (const pSchema of Object.values(brsrIndicatorRegistry.section_c.principles)) {
      const pNum = pSchema.principle.replace("P", "");
      const essentialKeys = Object.keys(pSchema.essential_indicators);
      const leadershipKeys = Object.keys(pSchema.leadership_indicators);
      totalIndicatorsByPrinciple[pNum] = essentialKeys.length + leadershipKeys.length;
      indicatorsByPrinciple[pNum] = new Set();
    }

    const sectionCoverage: SectionCoverage[] = [
      { section: "section_a", label: SECTION_LABELS.section_a, description: SECTION_DESCRIPTIONS.section_a, covered: false, evidenceCount: 0, latestEvidenceAt: null, evidenceKinds: [] },
      { section: "section_b", label: SECTION_LABELS.section_b, description: SECTION_DESCRIPTIONS.section_b, covered: false, evidenceCount: 0, latestEvidenceAt: null, evidenceKinds: [] },
      { section: "section_c", label: SECTION_LABELS.section_c, description: SECTION_DESCRIPTIONS.section_c, covered: false, evidenceCount: 0, latestEvidenceAt: null, evidenceKinds: [] },
    ];

    const evidenceKinds = new Set<string>();
    const sourceChannels = new Set<string>();
    let latestIngestedAt: string | null = null;
    let totalIndicatorsExtracted = 0;

    for (const record of brsrRecords) {
      const recordData = (record.data ?? {}) as Record<string, unknown>;
      const inferredSections = inferSectionCoverage(record.record_type, recordData);

      for (const section of sectionCoverage) {
        if (inferredSections.has(section.section)) {
          section.covered = true;
          section.evidenceCount += 1;
          section.latestEvidenceAt = record.created_at;
          const kind = typeof recordData.kind === "string" ? recordData.kind : record.record_type;
          if (!section.evidenceKinds.includes(kind)) {
            section.evidenceKinds.push(kind);
          }
        }
      }

      // Extract indicator-level coverage from AI extraction results
      const indicatorsExtracted = recordData.indicators_extracted as Record<string, Record<string, unknown>> | undefined;
      if (indicatorsExtracted) {
        for (const [principleKey, indicators] of Object.entries(indicatorsExtracted)) {
          const pNum = principleKey.replace("p", "").replace("P", "");
          if (indicatorsByPrinciple[pNum]) {
            for (const indicatorKey of Object.keys(indicators)) {
              indicatorsByPrinciple[pNum].add(indicatorKey);
              totalIndicatorsExtracted += 1;
            }
          }
        }
      }

      // Also check individual indicator fields in data
      for (const [key, value] of Object.entries(recordData)) {
        if (key.startsWith("p") && typeof value === "object" && value !== null) {
          const pNum = key.replace("p", "").replace("P", "");
          if (indicatorsByPrinciple[pNum]) {
            for (const indicatorKey of Object.keys(value as Record<string, unknown>)) {
              indicatorsByPrinciple[pNum].add(indicatorKey);
            }
          }
        }
      }

      const kind = typeof recordData.kind === "string" ? recordData.kind : record.record_type;
      evidenceKinds.add(kind);
      if (record.source_channel) {
        sourceChannels.add(record.source_channel);
      }
      if (!latestIngestedAt || record.created_at > latestIngestedAt) {
        latestIngestedAt = record.created_at;
      }
    }

    // Calculate overall score based on indicator coverage
    const totalPossibleIndicators = Object.values(totalIndicatorsByPrinciple).reduce((a, b) => a + b, 0);
    const totalCoveredIndicators = Object.values(indicatorsByPrinciple).reduce((sum, s) => sum + s.size, 0);
    const indicatorBasedScore = totalPossibleIndicators > 0 ? Math.round((totalCoveredIndicators / totalPossibleIndicators) * 100) : 0;

    // Fallback to section-based score if no indicator data
    const coveredSections = sectionCoverage.filter((s) => s.covered).length;
    const sectionBasedScore = Math.round((coveredSections / sectionCoverage.length) * 100);
    const overallScore = totalIndicatorsExtracted > 0 ? indicatorBasedScore : sectionBasedScore;

    const totalRecords = brsrRecords.length;
    const totalEvidence = brsrRecords.filter(
      (r) => r.status === "final" || r.status === "completed"
    ).length;

    let readinessLevel: ReadinessSummary["readinessLevel"] = "not_started";
    if (overallScore === 0 && totalEvidence === 0) {
      readinessLevel = "not_started";
    } else if (overallScore < 25) {
      readinessLevel = "early";
    } else if (overallScore < 50) {
      readinessLevel = "in_progress";
    } else if (overallScore < 80) {
      readinessLevel = "almost_ready";
    } else {
      readinessLevel = "ready";
    }

    return {
      overallScore,
      sectionCoverage,
      totalEvidence,
      totalRecords,
      sourceChannels: [...sourceChannels],
      lastIngestedAt: latestIngestedAt,
      readinessLevel,
    };
  },

  async computeSectionDetail(supabase: SupabaseClient, orgId: string): Promise<SectionDetail[]> {
    const { data: records, error } = await supabase
      .from("data_records")
      .select("id, record_type, title, data, source_channel, created_at, status")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError("Failed to fetch data records", 500, "DB_READ_FAILED", error);
    }

    const brsrRecords = (records ?? []).filter(
      (r) =>
        r.record_type.startsWith("brsr_") ||
        r.record_type.includes("brsr")
    );

    const sectionDetails: SectionDetail[] = [
      { section: "section_a", label: SECTION_LABELS.section_a, description: SECTION_DESCRIPTIONS.section_a, coveragePercent: 0, evidenceCount: 0, evidenceKinds: [], records: [] },
      { section: "section_b", label: SECTION_LABELS.section_b, description: SECTION_DESCRIPTIONS.section_b, coveragePercent: 0, evidenceCount: 0, evidenceKinds: [], records: [] },
      { section: "section_c", label: SECTION_LABELS.section_c, description: SECTION_DESCRIPTIONS.section_c, coveragePercent: 0, evidenceCount: 0, evidenceKinds: [], records: [] },
    ];

    for (const record of brsrRecords) {
      const recordData = (record.data ?? {}) as Record<string, unknown>;
      const inferredSections = inferSectionCoverage(record.record_type, recordData);

      for (const section of sectionDetails) {
        if (inferredSections.has(section.section)) {
          section.evidenceCount += 1;
          const kind = typeof recordData.kind === "string" ? recordData.kind : record.record_type;
          if (!section.evidenceKinds.includes(kind)) {
            section.evidenceKinds.push(kind);
          }
          section.records.push({
            id: record.id,
            title: record.title || record.record_type,
            recordType: record.record_type,
            sourceChannel: record.source_channel,
            createdAt: record.created_at,
            status: record.status,
          });
        }
      }
    }

    // Estimate coverage based on evidence presence
    for (const section of sectionDetails) {
      section.coveragePercent = section.evidenceCount > 0 ? Math.min(100, section.evidenceCount * 25) : 0;
    }

    return sectionDetails;
  },

  async computePrincipleDetail(supabase: SupabaseClient, orgId: string): Promise<PrincipleDetail[]> {
    const { data: records, error } = await supabase
      .from("data_records")
      .select("id, record_type, title, data, source_channel, created_at, status")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError("Failed to fetch data records", 500, "DB_READ_FAILED", error);
    }

    const brsrRecords = (records ?? []).filter(
      (r) =>
        r.record_type.startsWith("brsr_") ||
        r.record_type.includes("brsr")
    );

    // Initialize from registry
    const principleDetails: PrincipleDetail[] = Object.values(brsrIndicatorRegistry.section_c.principles).map((pSchema) => ({
      principle: parseInt(pSchema.principle.replace("P", ""), 10),
      title: pSchema.title,
      description: PRINCIPLE_DESCRIPTIONS[parseInt(pSchema.principle.replace("P", ""), 10)] || "",
      coveragePercent: 0,
      evidenceCount: 0,
      essentialIndicators: 0,
      leadershipIndicators: 0,
      totalEssentialIndicators: Object.keys(pSchema.essential_indicators).length,
      totalLeadershipIndicators: Object.keys(pSchema.leadership_indicators).length,
      indicatorsExtracted: [],
      latestEvidenceAt: null,
      records: [],
    }));

    for (const record of brsrRecords) {
      const recordData = (record.data ?? {}) as Record<string, unknown>;
      const inferredPrinciples = inferPrincipleCoverage(record.record_type, recordData);

      // Check for indicator-level extraction data
      const indicatorsExtracted = recordData.indicators_extracted as Record<string, Record<string, unknown>> | undefined;
      if (indicatorsExtracted) {
        for (const [principleKey, indicators] of Object.entries(indicatorsExtracted)) {
          const pNum = parseInt(principleKey.replace("p", "").replace("P", ""), 10);
          const detail = principleDetails.find((p) => p.principle === pNum);
          if (detail) {
            detail.evidenceCount += 1;
            detail.indicatorsExtracted.push(...Object.keys(indicators));
          }
        }
      }

      for (const p of inferredPrinciples) {
        const detail = principleDetails[p - 1];
        if (detail) {
          detail.records.push({
            id: record.id,
            title: record.title || record.record_type,
            recordType: record.record_type,
            sourceChannel: record.source_channel,
            createdAt: record.created_at,
            status: record.status,
          });
        }
      }
    }

    // Calculate coverage based on indicators extracted
    for (const p of principleDetails) {
      const uniqueIndicators = new Set(p.indicatorsExtracted).size;
      const totalIndicators = p.totalEssentialIndicators + p.totalLeadershipIndicators;
      p.coveragePercent = totalIndicators > 0 ? Math.round((uniqueIndicators / totalIndicators) * 100) : 0;
      p.essentialIndicators = Math.min(uniqueIndicators, p.totalEssentialIndicators);
      p.leadershipIndicators = Math.max(0, uniqueIndicators - p.totalEssentialIndicators);
    }

    return principleDetails;
  },

  async computeGaps(supabase: SupabaseClient, orgId: string): Promise<GapsSummary> {
    const readiness = await this.computeReadiness(supabase, orgId);
    const sectionDetails = await this.computeSectionDetail(supabase, orgId);

    const gaps: GapItem[] = [];

    // Check uncovered sections
    for (const section of readiness.sectionCoverage) {
      if (!section.covered) {
        gaps.push({
          section: section.section,
          label: section.label,
          type: "section",
          severity: "high",
          description: `No evidence found for ${section.label}`,
          recommendedAction: `Upload ${section.label.toLowerCase()} documents (PDFs, spreadsheets, or policy files)`,
        });
      }
    }

    // Check principle-level gaps
    const principleDetails = await this.computePrincipleDetail(supabase, orgId);
    for (const p of principleDetails) {
      if (p.evidenceCount === 0) {
        gaps.push({
          section: `principle_${p.principle}`,
          label: p.title,
          type: "principle",
          severity: "medium",
          description: `No evidence found for ${p.title}`,
          recommendedAction: `Upload principle-wise indicator data for ${p.title}`,
        });
      }
    }

    // Check assurance gaps
    const hasAnyAssuranceEvidence = sectionDetails.some(
      (s) => s.evidenceKinds.some((k) => k.toLowerCase().includes("assurance"))
    );
    if (!hasAnyAssuranceEvidence && readiness.totalEvidence > 0) {
      gaps.push({
        section: "assurance",
        label: "Assurance Coverage",
        type: "assurance",
        severity: "medium",
        description: "No assurance evidence detected",
        recommendedAction: "Upload external assurance statements or auditor confirmations",
      });
    }

    // Check value chain gaps
    const hasValueChainEvidence = sectionDetails.some(
      (s) => s.evidenceKinds.some((k) => k.toLowerCase().includes("value chain") || k.toLowerCase().includes("supply chain"))
    );
    if (!hasValueChainEvidence && readiness.totalEvidence > 0) {
      gaps.push({
        section: "value_chain",
        label: "Value Chain Coverage",
        type: "value_chain",
        severity: "low",
        description: "No value chain or supply chain evidence detected",
        recommendedAction: "Upload supplier disclosures, partner reports, or value chain data",
      });
    }

    const recommendedActions = gaps
      .sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      })
      .map((g) => g.recommendedAction);

    return {
      gaps,
      totalGaps: gaps.length,
      criticalGaps: gaps.filter((g) => g.severity === "high").length,
      recommendedActions,
    };
  }
};
