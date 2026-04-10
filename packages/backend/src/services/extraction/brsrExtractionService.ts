import type { SupabaseClient } from "@supabase/supabase-js";

import { env } from "../../config.js";
import { AppError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";
import type { AuthContext } from "../../types/auth.js";
import { createAIProvider } from "../ai/providerFactory.js";
import { brsrIndicatorRegistry } from "./brsrIndicatorSchema.js";

interface AIBRSRExtractionResult {
  section: string;
  principles: number[];
  indicatorsExtracted: Record<string, Record<string, unknown>>;
  indicatorsMissing: string[];
  completenessScore: number;
  confidence: number;
  evidenceKinds: string[];
  recommendedActions: string[];
}

const buildIndicatorAwarePrompt = (): string => {
  const principleSummaries = Object.values(brsrIndicatorRegistry.section_c.principles)
    .map((p) => {
      const essentialKeys = Object.keys(p.essential_indicators).join(", ");
      const leadershipKeys = Object.keys(p.leadership_indicators).join(", ");
      return `${p.principle} (${p.title}): Essential=[${essentialKeys}] Leadership=[${leadershipKeys}]`;
    })
    .join("\n");

  return `You are EnovAIt's BRSR indicator-level extraction engine. You extract data at the specific indicator level defined by SEBI's BRSR format.

BRSR Indicator Registry:
${principleSummaries}

Section A: General Disclosures (entity details, products, operations, workforce, material issues)
Section B: Management Process (policy coverage P1-P9, board approval, value chain, governance)
Section C: Principle-wise Performance (specific indicators for each principle as listed above)

Rules:
1. Extract data ONLY into the specific indicator fields listed above — never invent fields
2. Use exact units: KJ for energy, kilolitres for water, tCO2e for emissions, metric tonnes for waste
3. For gender/category breakdowns, use male/female/other and permanent/other-than-permanent
4. For year-over-year, extract both current and previous year values
5. Leave fields as missing if not present in the text
6. Return ALL indicator keys even if null — this is critical for completeness tracking
7. Identify which section (section_a, section_b, section_c) and which principles (P1-P9) apply
8. Return valid JSON only

Return JSON with this structure:
{
  "section": "section_a" | "section_b" | "section_c" | "multiple",
  "principles": [1, 2, 3],
  "indicatorsExtracted": { "p3": { "e1_wellbeing_measures_employees": { ... }, "e2_retirement_benefits": [...] }, "p6": { ... } },
  "indicatorsMissing": ["p6.e3_water_withdrawal", "p6.e6_ghg_emissions.scope1_tco2e"],
  "completenessScore": 0.35,
  "confidence": 0.85,
  "evidenceKinds": ["metric", "policy", "assurance"],
  "recommendedActions": ["action1"]
}`;
};

const extractBRSRClassification = async (
  text: string,
  fileName: string
): Promise<AIBRSRExtractionResult> => {
  const provider = createAIProvider();
  if (!provider) {
    logger.warn({ provider: env.AI_PROVIDER }, "No AI provider available for BRSR classification");
    return {
      section: "section_a",
      principles: [],
      indicatorsExtracted: {},
      indicatorsMissing: [],
      completenessScore: 0,
      confidence: 0,
      evidenceKinds: [],
      recommendedActions: ["Configure an AI provider for automated BRSR indicator extraction"],
    };
  }

  const truncatedText = text.slice(0, 8000);
  const prompt = buildIndicatorAwarePrompt();

  const result = await provider.extractStructuredData({
    moduleCode: "brsr",
    moduleName: "BRSR India",
    message: `${prompt}\n\nDocument: ${fileName}\n\nContent:\n${truncatedText}`,
    history: [],
  });

  try {
    const fields = result.extracted_fields as Record<string, unknown>;
    const principlesRaw = fields.principles;
    const principles: number[] = Array.isArray(principlesRaw)
      ? principlesRaw.filter((p): p is number => typeof p === "number" && p >= 1 && p <= 9)
      : [];

    return {
      section: (typeof fields.section === "string" ? fields.section : "section_a") as AIBRSRExtractionResult["section"],
      principles,
      indicatorsExtracted: (fields.indicatorsExtracted ?? {}) as Record<string, Record<string, unknown>>,
      indicatorsMissing: Array.isArray(fields.indicatorsMissing)
        ? fields.indicatorsMissing.filter((f): f is string => typeof f === "string")
        : [],
      completenessScore: typeof fields.completenessScore === "number" ? fields.completenessScore : 0,
      confidence: typeof fields.confidence === "number" ? fields.confidence : 0,
      evidenceKinds: Array.isArray(fields.evidenceKinds)
        ? fields.evidenceKinds.filter((k): k is string => typeof k === "string")
        : [],
      recommendedActions: Array.isArray(fields.recommendedActions)
        ? fields.recommendedActions.filter((a): a is string => typeof a === "string")
        : [],
    };
  } catch {
    logger.warn({ fileName }, "Failed to parse BRSR indicator extraction result");
    return {
      section: "section_a",
      principles: [],
      indicatorsExtracted: {},
      indicatorsMissing: [],
      completenessScore: 0,
      confidence: 0,
      evidenceKinds: [],
      recommendedActions: ["Manual review recommended — AI indicator extraction failed"],
    };
  }
};

const determineBRSRRecordType = (section: string, principles: number[]): string => {
  if (principles.length > 0) {
    return `brsr_principle_${principles.join("_")}`;
  }
  return `brsr_${section}_evidence`;
};

export const brsrExtractionService = {
  async extractAndClassify(
    supabase: SupabaseClient,
    auth: AuthContext,
    moduleId: string,
    textContent: string,
    fileName: string,
    existingRecordId: string
  ): Promise<{ classification: AIBRSRExtractionResult; updatedRecordId: string }> {
    const classification = await extractBRSRClassification(textContent, fileName);

    const recordType = determineBRSRRecordType(classification.section, classification.principles);

    const { error: updateError } = await supabase
      .from("data_records")
      .update({
        record_type: recordType,
        title: `${fileName} — BRSR ${classification.section.replace("_", " ").toUpperCase()}`,
        data: {
          record_type: recordType,
          source_channel: "file_upload",
          file_name: fileName,
          kind: classification.evidenceKinds.length > 0 ? classification.evidenceKinds[0] : "document",
          brsr_section: classification.section,
          brsr_principles: classification.principles,
          indicators_extracted: classification.indicatorsExtracted,
          indicators_missing: classification.indicatorsMissing,
          completeness_score: classification.completenessScore,
          confidence: classification.confidence,
          evidence_kinds: classification.evidenceKinds,
          recommended_actions: classification.recommendedActions,
        },
        updated_by: auth.userId,
      })
      .eq("id", existingRecordId);

    if (updateError) {
      throw new AppError("Failed to update BRSR classification", 500, "DB_WRITE_FAILED", updateError);
    }

    // Create a workflow event for the classification
    await supabase
      .from("workflow_events")
      .insert({
        org_id: auth.orgId,
        module_id: moduleId,
        data_record_id: existingRecordId,
        event_type: "brsr.classified",
        payload: {
          section: classification.section,
          principles: classification.principles,
          confidence: classification.confidence,
          completeness_score: classification.completenessScore,
          indicators_extracted_count: Object.keys(classification.indicatorsExtracted).length,
          indicators_missing_count: classification.indicatorsMissing.length,
          evidence_kinds: classification.evidenceKinds,
        },
        created_by: auth.userId,
        updated_by: auth.userId,
      });

    return { classification, updatedRecordId: existingRecordId };
  },

  async processIngestedDocument(
    supabase: SupabaseClient,
    auth: AuthContext,
    moduleId: string,
    textContent: string,
    fileName: string,
    recordId: string
  ): Promise<void> {
    try {
      await this.extractAndClassify(supabase, auth, moduleId, textContent, fileName, recordId);
    } catch (error) {
      logger.error({ err: error, fileName }, "BRSR extraction failed for ingested document");
    }
  }
};
