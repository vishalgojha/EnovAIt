import type { SupabaseClient } from "@supabase/supabase-js";

import { AppError } from "../../lib/errors.js";
import type { AuthContext } from "../../types/auth.js";
import { brsrExtractionService } from "../extraction/brsrExtractionService.js";
import { workflowEngine } from "../workflow/workflowEngine.js";

interface WhatsAppResult {
  recordId: string;
  title: string;
  classification: {
    section: string;
    principles: number[];
    confidence: number;
    evidenceKinds: string[];
  };
}

const classifyWhatsAppIntent = (message: string): { intent: string; isBRSR: boolean } => {
  const lower = message.toLowerCase();

  const brsrKeywords = [
    "brsr", "esg", "sustainability", "emissions", "energy", "waste",
    "water", "carbon", "governance", "policy", "board", "principle",
    "employee", "safety", "training", "coverage", "assurance",
    "value chain", "supplier", "human rights", "ethics", "transparency",
    "diversity", "inclusion", "community", "consumer", "privacy",
    "scope 1", "scope 2", "scope 3", "ghg", "renewable",
    "water consumption", "waste management", "biodiversity",
    "csr", "corporate social responsibility",
    "section a", "section b", "section c",
    "p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9",
  ];

  const isBRSR = brsrKeywords.some((keyword) => lower.includes(keyword));

  if (lower.includes("energy") || lower.includes("kwh") || lower.includes("electricity")) {
    return { intent: "energy_data", isBRSR: true };
  }
  if (lower.includes("emission") || lower.includes("co2") || lower.includes("ghg") || lower.includes("carbon")) {
    return { intent: "emissions_data", isBRSR: true };
  }
  if (lower.includes("waste") || lower.includes("recycl")) {
    return { intent: "waste_data", isBRSR: true };
  }
  if (lower.includes("water") || lower.includes("consumption")) {
    return { intent: "water_data", isBRSR: true };
  }
  if (lower.includes("training") || lower.includes("employee") || lower.includes("safety")) {
    return { intent: "employee_wellbeing", isBRSR: true };
  }
  if (lower.includes("policy") || lower.includes("governance") || lower.includes("board")) {
    return { intent: "governance_policy", isBRSR: true };
  }
  if (lower.includes("supplier") || lower.includes("value chain") || lower.includes("vendor")) {
    return { intent: "value_chain", isBRSR: true };
  }
  if (lower.includes("assurance") || lower.includes("audit") || lower.includes("verified")) {
    return { intent: "assurance", isBRSR: true };
  }

  return { intent: isBRSR ? "brsr_general" : "general_message", isBRSR };
};

export const whatsappIntakeService = {
  async processTextMessage(
    supabase: SupabaseClient,
    auth: AuthContext,
    from: string,
    message: string
  ): Promise<WhatsAppResult> {
    // Resolve BRSR module
    const { data: module } = await supabase
      .from("modules")
      .select("id, code")
      .eq("org_id", auth.orgId)
      .in("code", ["brsr", "esg"])
      .limit(1)
      .maybeSingle();

    const moduleId = module?.id;
    if (!moduleId) {
      throw new AppError("No BRSR/ESG module found for this organization", 400, "MODULE_NOT_FOUND");
    }

    const intent = classifyWhatsAppIntent(message);

    const title = `WhatsApp from ${from.slice(-6)} — ${intent.intent}`;

    // Create evidence record
    const { data: record, error: recordError } = await supabase
      .from("data_records")
      .insert({
        org_id: auth.orgId,
        module_id: moduleId,
        record_type: "brsr_whatsapp_evidence",
        title,
        source_channel: "whatsapp",
        status: "draft",
        data: {
          record_type: "brsr_whatsapp_evidence",
          source_channel: "whatsapp",
          whatsapp_from: from,
          message_text: message,
          intent: intent.intent,
          is_brsr_relevant: intent.isBRSR,
          text_preview: message.slice(0, 1800),
        },
        created_by: auth.userId,
        updated_by: auth.userId,
      })
      .select("id")
      .single();

    if (recordError || !record) {
      throw new AppError("Failed to create WhatsApp evidence record", 500, "DB_WRITE_FAILED", recordError);
    }

    // Create workflow event
    await supabase.from("workflow_events").insert({
      org_id: auth.orgId,
      module_id: moduleId,
      data_record_id: record.id,
      event_type: "ingestion.whatsapp.received",
      payload: {
        from,
        intent: intent.intent,
        is_brsr_relevant: intent.isBRSR,
        text_preview: message.slice(0, 400),
      },
      created_by: auth.userId,
      updated_by: auth.userId,
    });

    // Run workflow
    await workflowEngine.runForRecord(supabase, {
      orgId: auth.orgId,
      moduleId,
      dataRecordId: record.id,
      recordData: {
        record_type: "brsr_whatsapp_evidence",
        source_channel: "whatsapp",
        whatsapp_from: from,
        intent: intent.intent,
      },
      actorUserId: auth.userId,
      triggerEvent: "record.completed",
    });

    // Run BRSR AI extraction
    if (module.code === "brsr" || module.code === "esg") {
      await brsrExtractionService.processIngestedDocument(
        supabase,
        auth,
        moduleId,
        message,
        `whatsapp_${from}`,
        record.id
      );
    }

    // Fetch the updated record to get classification
    const { data: updatedRecord } = await supabase
      .from("data_records")
      .select("data")
      .eq("id", record.id)
      .single();

    const recordData = (updatedRecord?.data ?? {}) as Record<string, unknown>;

    return {
      recordId: record.id,
      title,
      classification: {
        section: typeof recordData.brsr_section === "string" ? recordData.brsr_section : "unclassified",
        principles: Array.isArray(recordData.brsr_principles)
          ? (recordData.brsr_principles as number[])
          : [],
        confidence: typeof recordData.confidence === "number" ? recordData.confidence : 0,
        evidenceKinds: Array.isArray(recordData.evidence_kinds)
          ? (recordData.evidence_kinds as string[])
          : [],
      },
    };
  },

  async processEvidence(
    supabase: SupabaseClient,
    auth: AuthContext,
    from: string,
    message: string,
    moduleId?: string
  ): Promise<WhatsAppResult> {
    let targetModuleId = moduleId;

    if (!targetModuleId) {
      const { data: module } = await supabase
        .from("modules")
        .select("id, code")
        .eq("org_id", auth.orgId)
        .in("code", ["brsr", "esg"])
        .limit(1)
        .maybeSingle();

      targetModuleId = module?.id;
    }

    if (!targetModuleId) {
      throw new AppError("No BRSR/ESG module found for this organization", 400, "MODULE_NOT_FOUND");
    }

    return this.processTextMessage(supabase, auth, from, message);
  }
};
