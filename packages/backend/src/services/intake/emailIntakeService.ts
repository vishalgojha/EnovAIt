import { createClient } from "@supabase/supabase-js";

import { env } from "../../config.js";
import { AppError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";
import { brsrExtractionService } from "../extraction/brsrExtractionService.js";
import { workflowEngine } from "../workflow/workflowEngine.js";

interface EmailPayload {
  from?: string;
  to?: string;
  subject?: string;
  body?: string;
  html_body?: string;
  date?: string;
  attachments?: Array<{
    filename: string;
    content_type: string;
    data?: string;
    content?: string;
  }>;
  headers?: Record<string, string>;
}

interface IntakeResult {
  accepted: boolean;
  recordsCreated: number;
  ingestionEventIds: string[];
}

interface ForwardResult {
  recordId: string;
  title: string;
}

const normalizeEmailSubject = (subject: string): string => {
  return subject
    .replace(/^(re|fwd|fw):\s*/gi, "")
    .replace(/\[.*?\]/g, "")
    .trim()
    .slice(0, 200) || "Email evidence";
};

const extractTextFromEmail = (payload: EmailPayload): string => {
  const parts: string[] = [];

  if (payload.subject) {
    parts.push(`Subject: ${payload.subject}`);
  }
  if (payload.from) {
    parts.push(`From: ${payload.from}`);
  }
  if (payload.to) {
    parts.push(`To: ${payload.to}`);
  }
  if (payload.date) {
    parts.push(`Date: ${payload.date}`);
  }

  parts.push("");
  parts.push("--- Body ---");
  parts.push(payload.body ?? payload.html_body ?? "(no body)");

  if (payload.attachments?.length) {
    parts.push("");
    parts.push("--- Attachments ---");
    for (const att of payload.attachments) {
      parts.push(`- ${att.filename} (${att.content_type})`);
    }
  }

  return parts.join("\n");
};

export const emailIntakeService = {
  async processIncomingEmail(payload: EmailPayload): Promise<IntakeResult> {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    const subject = payload.subject ?? "Untitled email";
    const normalizedTitle = normalizeEmailSubject(subject);
    const fullText = extractTextFromEmail(payload);

    // Find or create org based on recipient email
    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (!org) {
      logger.warn({ subject }, "No active org found for email intake");
      return { accepted: false, recordsCreated: 0, ingestionEventIds: [] };
    }

    // Find BRSR module for this org
    const { data: module } = await supabase
      .from("modules")
      .select("id, code")
      .eq("org_id", org.id)
      .in("code", ["brsr", "esg"])
      .limit(1)
      .maybeSingle();

    const moduleId = module?.id ?? (
      await supabase
        .from("modules")
        .select("id")
        .eq("org_id", org.id)
        .limit(1)
        .maybeSingle()
    ).data?.id;

    if (!moduleId) {
      logger.warn({ orgId: org.id }, "No module found for email intake");
      return { accepted: false, recordsCreated: 0, ingestionEventIds: [] };
    }

    // Create evidence record
    const { data: record, error: recordError } = await supabase
      .from("data_records")
      .insert({
        org_id: org.id,
        module_id: moduleId,
        record_type: "brsr_email_evidence",
        title: normalizedTitle,
        source_channel: "email",
        status: "draft",
        data: {
          record_type: "brsr_email_evidence",
          source_channel: "email",
          email_from: payload.from ?? null,
          email_to: payload.to ?? null,
          email_subject: subject,
          email_date: payload.date ?? null,
          text_preview: fullText.slice(0, 1800),
          extracted_text: fullText.slice(0, 12000),
          attachment_count: payload.attachments?.length ?? 0,
          attachment_names: payload.attachments?.map((a) => a.filename) ?? [],
        },
        created_by: null,
        updated_by: null,
      })
      .select("id")
      .single();

    if (recordError || !record) {
      throw new AppError("Failed to create email evidence record", 500, "DB_WRITE_FAILED", recordError);
    }

    // Create workflow event
    const { data: event } = await supabase
      .from("workflow_events")
      .insert({
        org_id: org.id,
        module_id: moduleId,
        data_record_id: record.id,
        event_type: "ingestion.email.received",
        payload: {
          from: payload.from,
          subject,
          attachment_count: payload.attachments?.length ?? 0,
        },
        created_by: null,
        updated_by: null,
      })
      .select("id")
      .single();

    // Run workflow
    await workflowEngine.runForRecord(supabase, {
      orgId: org.id,
      moduleId,
      dataRecordId: record.id,
      recordData: {
        record_type: "brsr_email_evidence",
        source_channel: "email",
        email_from: payload.from,
        email_subject: subject,
      },
      actorUserId: org.id,
      triggerEvent: "record.completed",
    });

    // Run BRSR AI extraction
    if (module?.code === "brsr" || module?.code === "esg") {
      await brsrExtractionService.processIngestedDocument(
        supabase,
        { orgId: org.id, userId: org.id, role: "system", email: "system@enovait.local" },
        moduleId,
        fullText,
        subject,
        record.id
      );
    }

    logger.info(
      { recordId: record.id, subject, from: payload.from },
      "Email evidence ingested successfully"
    );

    return {
      accepted: true,
      recordsCreated: 1,
      ingestionEventIds: [event?.id ?? ""],
    };
  },

  async forwardEvidenceToModule(
    orgId: string,
    moduleId: string,
    emailData: EmailPayload
  ): Promise<ForwardResult> {
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    const subject = emailData.subject ?? "Forwarded evidence";
    const normalizedTitle = normalizeEmailSubject(subject);
    const fullText = extractTextFromEmail(emailData);

    const { data: record, error } = await supabase
      .from("data_records")
      .insert({
        org_id: orgId,
        module_id: moduleId,
        record_type: "brsr_email_evidence",
        title: normalizedTitle,
        source_channel: "email",
        status: "draft",
        data: {
          record_type: "brsr_email_evidence",
          source_channel: "email",
          email_from: emailData.from ?? null,
          email_subject: subject,
          text_preview: fullText.slice(0, 1800),
          extracted_text: fullText.slice(0, 12000),
        },
        created_by: null,
        updated_by: null,
      })
      .select("id, title")
      .single();

    if (error || !record) {
      throw new AppError("Failed to forward email evidence", 500, "DB_WRITE_FAILED", error);
    }

    return {
      recordId: record.id,
      title: record.title,
    };
  }
};
