import type { SupabaseClient } from "@supabase/supabase-js";

import type { ChatMessageRequest } from "../../api/schemas/chatSchemas.js";
import { AppError } from "../../lib/errors.js";
import type { AuthContext } from "../../types/auth.js";
import { createAIProvider } from "../ai/providerFactory.js";
import type { ExtractionResult } from "../ai/types.js";
import { workflowEngine } from "../workflow/workflowEngine.js";

interface SessionModuleRow {
  id: string;
  org_id: string;
  module_id: string;
  thread_id: string;
  module: {
    id: string;
    code: string;
    name: string;
  } | null;
}

const aiProvider = createAIProvider();

const getTemplateContext = async (supabase: SupabaseClient, orgId: string, moduleId: string): Promise<{
  schema: Record<string, unknown>;
  questionFlow: Array<Record<string, unknown>>;
}> => {
  const { data } = await supabase
    .from("templates")
    .select("schema, question_flow")
    .eq("org_id", orgId)
    .eq("module_id", moduleId)
    .eq("is_active", true)
    .order("is_default", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    schema: (data?.schema as Record<string, unknown> | undefined) ?? {},
    questionFlow: (data?.question_flow as Array<Record<string, unknown>> | undefined) ?? []
  };
};

const persistAssistantMessage = async (
  supabase: SupabaseClient,
  auth: AuthContext,
  sessionId: string,
  content: string,
  metadata: Record<string, unknown>
): Promise<void> => {
  const { error } = await supabase.from("messages").insert({
    org_id: auth.orgId,
    session_id: sessionId,
    sender_id: auth.userId,
    role: "assistant",
    content,
    metadata,
    created_by: auth.userId,
    updated_by: auth.userId
  });

  if (error) {
    throw new AppError("Failed to persist assistant message", 500, "DB_WRITE_FAILED", error);
  }
};

const upsertDataRecord = async (
  supabase: SupabaseClient,
  auth: AuthContext,
  session: SessionModuleRow,
  extractionId: string,
  extraction: ExtractionResult
): Promise<string> => {
  const normalizedKey =
    typeof extraction.extracted_fields["external_id"] === "string"
      ? (extraction.extracted_fields["external_id"] as string)
      : `${session.thread_id}:${extraction.record_type}`;

  const payload = {
    ...extraction.extracted_fields,
    _confidence: extraction.confidence,
    _intent: extraction.intent
  };

  const { data: existing } = await supabase
    .from("data_records")
    .select("id")
    .eq("org_id", auth.orgId)
    .eq("module_id", session.module_id)
    .eq("source_session_id", session.id)
    .eq("record_type", extraction.record_type)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("data_records")
      .update({
        title: extraction.title,
        normalized_key: normalizedKey,
        data: payload,
        status: "final",
        source_extraction_id: extractionId,
        updated_by: auth.userId
      })
      .eq("id", existing.id)
      .eq("org_id", auth.orgId);

    if (error) {
      throw new AppError("Failed to update data record", 500, "DB_WRITE_FAILED", error);
    }
    return existing.id;
  }

  const { data: inserted, error } = await supabase
    .from("data_records")
    .insert({
      org_id: auth.orgId,
      module_id: session.module_id,
      source_session_id: session.id,
      source_extraction_id: extractionId,
      record_type: extraction.record_type,
      title: extraction.title,
      normalized_key: normalizedKey,
      source_channel: "chat",
      status: "final",
      data: payload,
      created_by: auth.userId,
      updated_by: auth.userId
    })
    .select("id")
    .single();

  if (error || !inserted) {
    throw new AppError("Failed to create data record", 500, "DB_WRITE_FAILED", error);
  }

  return inserted.id;
};

export const chatService = {
  async processMessage(supabase: SupabaseClient, auth: AuthContext, payload: ChatMessageRequest) {
    const { data: sessionData, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("id, org_id, module_id, thread_id, module:modules(id, code, name)")
      .eq("id", payload.session_id)
      .eq("org_id", auth.orgId)
      .single();

    if (sessionError || !sessionData) {
      throw new AppError("Chat session not found", 404, "SESSION_NOT_FOUND", sessionError);
    }

    const session = sessionData as unknown as SessionModuleRow;
    if (!session.module) {
      throw new AppError("Module missing for session", 500, "MODULE_NOT_FOUND");
    }

    const { error: messageError, data: userMessage } = await supabase
      .from("messages")
      .insert({
        org_id: auth.orgId,
        session_id: session.id,
        sender_id: auth.userId,
        role: "user",
        content: payload.message,
        metadata: {},
        created_by: auth.userId,
        updated_by: auth.userId
      })
      .select("id")
      .single();

    if (messageError || !userMessage) {
      throw new AppError("Failed to save user message", 500, "DB_WRITE_FAILED", messageError);
    }

    const { data: recentMessages } = await supabase
      .from("messages")
      .select("role, content")
      .eq("session_id", session.id)
      .order("created_at", { ascending: false })
      .limit(20);

    const context = await getTemplateContext(supabase, auth.orgId, session.module_id);

    const extraction = await aiProvider.extractStructuredData({
      moduleCode: session.module.code,
      moduleName: session.module.name,
      message: payload.message,
      history: (recentMessages ?? [])
        .map((item) => ({
          role: item.role as "user" | "assistant" | "system",
          content: item.content as string
        }))
        .reverse(),
      templateSchema: context.schema,
      questionFlow: context.questionFlow
    });

    const extractionStatus = extraction.is_complete ? "completed" : "partial";

    const { data: extractionRow, error: extractionError } = await supabase
      .from("extracted_data")
      .insert({
        org_id: auth.orgId,
        module_id: session.module_id,
        session_id: session.id,
        message_id: userMessage.id,
        extractor_provider: process.env.AI_PROVIDER ?? "openai",
        model_name: process.env.AI_MODEL ?? "gpt-4o-mini",
        payload: extraction.extracted_fields,
        completeness_score: Number((extraction.completeness_score * 100).toFixed(2)),
        missing_fields: extraction.missing_fields,
        validation_errors: [],
        status: extractionStatus,
        created_by: auth.userId,
        updated_by: auth.userId
      })
      .select("id")
      .single();

    if (extractionError || !extractionRow) {
      throw new AppError("Failed to persist extracted data", 500, "DB_WRITE_FAILED", extractionError);
    }

    let dataRecordId: string | null = null;
    let workflowInstanceIds: string[] = [];

    if (extraction.is_complete) {
      dataRecordId = await upsertDataRecord(supabase, auth, session, extractionRow.id, extraction);
      workflowInstanceIds = await workflowEngine.runForRecord(supabase, {
        orgId: auth.orgId,
        moduleId: session.module_id,
        dataRecordId,
        recordData: extraction.extracted_fields,
        actorUserId: auth.userId,
        triggerEvent: "record.completed"
      });
    }

    await persistAssistantMessage(supabase, auth, session.id, extraction.assistant_response, {
      extraction_id: extractionRow.id,
      complete: extraction.is_complete,
      missing_fields: extraction.missing_fields,
      data_record_id: dataRecordId
    });

    return {
      session_id: session.id,
      assistant_message: extraction.assistant_response,
      requires_clarification: !extraction.is_complete,
      missing_fields: extraction.missing_fields,
      extracted_data_id: extractionRow.id,
      data_record_id: dataRecordId,
      workflow_instance_ids: workflowInstanceIds,
      confidence: extraction.confidence
    };
  }
};
