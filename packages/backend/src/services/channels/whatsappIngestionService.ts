import { randomUUID } from "crypto";

import { supabaseAdmin } from "../../lib/supabase.js";
import { AppError } from "../../lib/errors.js";
import { brsrExtractionService } from "../extraction/brsrExtractionService.js";
import { workflowEngine } from "../workflow/workflowEngine.js";

type WhatsAppProvider = "official" | "baileys" | "generic";

interface ResolvedIntegration {
  id: string;
  org_id: string;
  module_id: string | null;
  integration_type: string;
  name: string;
  config: Record<string, unknown>;
}

interface NormalizedWhatsAppMessage {
  message_id: string;
  from: string | null;
  from_name: string | null;
  message_type: string;
  text: string | null;
  caption: string | null;
  media_url: string | null;
  mime_type: string | null;
  file_name: string | null;
  timestamp: string | null;
  raw: Record<string, unknown>;
}

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const asString = (value: unknown): string | null => (typeof value === "string" && value.trim().length > 0 ? value.trim() : null);

const normalizeFrom = (value: unknown): string | null => {
  const raw = asString(value);
  if (!raw) {
    return null;
  }
  return raw.replace(/[^\d+]/g, "");
};

const findModules = async (orgId: string): Promise<Array<{ id: string; code: string; name: string }>> => {
  const { data, error } = await supabaseAdmin
    .from("modules")
    .select("id, code, name")
    .eq("org_id", orgId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    throw new AppError("Failed to resolve modules for WhatsApp ingestion", 500, "DB_READ_FAILED", error);
  }

  return data ?? [];
};

const resolveModuleId = async (orgId: string, integration: ResolvedIntegration): Promise<string> => {
  if (integration.module_id) {
    return integration.module_id;
  }

  const modules = await findModules(orgId);
  const preferred =
    modules.find((module) => module.code === "brsr_india") ||
    modules.find((module) => module.code === "brsr") ||
    modules.find((module) => module.code === "esg") ||
    modules[0];

  if (!preferred) {
    throw new AppError("No active module available for WhatsApp ingestion", 400, "MODULE_NOT_FOUND");
  }

  return preferred.id;
};

const resolveIntegration = async (integrationId?: string): Promise<ResolvedIntegration> => {
  const query = supabaseAdmin
    .from("integrations")
    .select("id, org_id, module_id, integration_type, name, config")
    .eq("is_active", true)
    .eq("integration_type", "whatsapp_official");

  if (integrationId) {
    const { data, error } = await query.eq("id", integrationId).single();
    if (error || !data) {
      throw new AppError("WhatsApp integration not found", 404, "INTEGRATION_NOT_FOUND", error);
    }
    return data as ResolvedIntegration;
  }

  const { data, error } = await query.order("created_at", { ascending: true }).limit(1).single();
  if (error || !data) {
    throw new AppError("No active WhatsApp integration available", 400, "INTEGRATION_NOT_FOUND", error);
  }
  return data as ResolvedIntegration;
};

const flattenOfficialMessages = (payload: unknown): NormalizedWhatsAppMessage[] => {
  const root = asRecord(payload);
  const entries = Array.isArray(root.entry) ? root.entry : [];
  const messages: NormalizedWhatsAppMessage[] = [];

  for (const entry of entries) {
    const changes = Array.isArray((entry as Record<string, unknown>).changes) ? ((entry as Record<string, unknown>).changes as Array<Record<string, unknown>>) : [];
    for (const change of changes) {
      const value = asRecord(change.value);
      const contacts = Array.isArray(value.contacts) ? (value.contacts as Array<Record<string, unknown>>) : [];
      const contactName = asString(asRecord(contacts[0]?.profile).name);
      const valueMessages = Array.isArray(value.messages) ? (value.messages as Array<Record<string, unknown>>) : [];

      for (const message of valueMessages) {
        const messageType = asString(message.type) ?? "unknown";
        const messageId = asString(message.id) ?? randomUUID();
        const from = normalizeFrom(message.from);
        const timestamp = asString(message.timestamp);
        const textBody = asString(asRecord(message.text).body);
        const mediaObject = asRecord(message[messageType]);

        messages.push({
          message_id: messageId,
          from,
          from_name: contactName,
          message_type: messageType,
          text: textBody,
          caption: asString(mediaObject.caption),
          media_url: asString(mediaObject.link) ?? asString(mediaObject.url),
          mime_type: asString(mediaObject.mime_type),
          file_name: asString(mediaObject.filename),
          timestamp,
          raw: message
        });
      }
    }
  }

  return messages;
};

const flattenGenericMessages = (payload: unknown): NormalizedWhatsAppMessage[] => {
  const root = asRecord(payload);
  const candidates: Array<Record<string, unknown>> = [];

  if (Array.isArray(root.messages)) {
    candidates.push(...(root.messages as Array<Record<string, unknown>>));
  }
  if (Array.isArray(asRecord(root.data).messages)) {
    candidates.push(...((asRecord(root.data).messages as Array<Record<string, unknown>>)));
  }
  if (Array.isArray(asRecord(root.data).events)) {
    candidates.push(...((asRecord(root.data).events as Array<Record<string, unknown>>)));
  }
  if (root.message && typeof root.message === "object") {
    candidates.push(root.message as Record<string, unknown>);
  }
  if (root.data && typeof root.data === "object" && asRecord(root.data).message && typeof asRecord(root.data).message === "object") {
    candidates.push(asRecord(root.data).message as Record<string, unknown>);
  }

  const messages: NormalizedWhatsAppMessage[] = [];
  for (const item of candidates) {
    const messageType = asString(item.type) ?? asString(item.event) ?? "unknown";
    const messageId = asString(item.id) ?? asString(item.message_id) ?? randomUUID();
    const from = normalizeFrom(item.from ?? item.sender ?? item.phone_number);
    const timestamp = asString(item.timestamp) ?? asString(item.sent_at) ?? asString(item.created_at);
    const text = asString(item.text) ?? asString(item.body) ?? asString(item.message);
    const caption = asString(item.caption);
    const media = asRecord(item.media ?? item.file ?? item.document ?? item.image);

    messages.push({
      message_id: messageId,
      from,
      from_name: asString(item.contact_name) ?? asString(item.sender_name) ?? null,
      message_type: messageType,
      text,
      caption,
      media_url: asString(item.media_url) ?? asString(item.url) ?? asString(media.url) ?? asString(media.link),
      mime_type: asString(item.mime_type) ?? asString(media.mime_type),
      file_name: asString(item.file_name) ?? asString(media.filename),
      timestamp,
      raw: item
    });
  }

  return messages;
};

const collectMessages = (provider: WhatsAppProvider, payload: unknown): NormalizedWhatsAppMessage[] => {
  if (provider === "official") {
    const messages = flattenOfficialMessages(payload);
    if (messages.length) {
      return messages;
    }
  }

  return flattenGenericMessages(payload);
};

const buildRecordTitle = (message: NormalizedWhatsAppMessage): string => {
  const name = message.from_name || message.from || "WhatsApp";
  const label = message.file_name || message.caption || message.text || message.message_type || "message";
  return `WhatsApp ${name} - ${label.slice(0, 48)}`;
};

export const whatsappIngestionService = {
  async ingestWebhook(payload: unknown, integrationId?: string, provider: WhatsAppProvider = "official") {
    const integration = await resolveIntegration(integrationId);
    const moduleId = await resolveModuleId(integration.org_id, integration);
    const messages = collectMessages(provider, payload);

    if (!messages.length) {
      return {
        integration_id: integration.id,
        org_id: integration.org_id,
        module_id: moduleId,
        provider,
        message_count: 0,
        record_ids: [],
        event_ids: [],
        summary: {
          detail: "No inbound WhatsApp messages were detected in the payload"
        }
      };
    }

    const recordIds: string[] = [];
    const eventIds: string[] = [];

    for (const message of messages) {
      const normalizedKey = `${integration.id}:${message.message_id}`;
      const summaryText = message.text || message.caption || message.file_name || "WhatsApp evidence";

      const { data: record, error: recordError } = await supabaseAdmin
        .from("data_records")
        .insert({
          org_id: integration.org_id,
          module_id: moduleId,
          record_type: "brsr_whatsapp_evidence",
          title: buildRecordTitle(message),
          normalized_key: normalizedKey,
          source_channel: integration.integration_type,
          status: "final",
          data: {
            integration_id: integration.id,
            integration_name: integration.name,
            provider,
            record_type: "brsr_whatsapp_evidence",
            source_channel: "whatsapp_official",
            message_id: message.message_id,
            from: message.from,
            from_name: message.from_name,
            message_type: message.message_type,
            text: message.text,
            caption: message.caption,
            media_url: message.media_url,
            mime_type: message.mime_type,
            file_name: message.file_name,
            timestamp: message.timestamp,
            raw: message.raw
          },
          created_by: null,
          updated_by: null
        })
        .select("id")
        .single();

      if (recordError || !record) {
        throw new AppError("Failed to create WhatsApp evidence record", 500, "DB_WRITE_FAILED", recordError);
      }

      const { data: event, error: eventError } = await supabaseAdmin
        .from("workflow_events")
        .insert({
          org_id: integration.org_id,
          module_id: moduleId,
          data_record_id: record.id,
          event_type: "ingestion.whatsapp.received",
          payload: {
            integration_id: integration.id,
            integration_name: integration.name,
            provider,
            message_id: message.message_id,
            from: message.from,
            from_name: message.from_name,
            message_type: message.message_type,
            text_preview: summaryText.slice(0, 400),
            media_url: message.media_url,
            mime_type: message.mime_type,
            file_name: message.file_name,
            timestamp: message.timestamp
          },
          processed_at: null,
          created_by: null,
          updated_by: null
        })
        .select("id")
        .single();

      if (eventError || !event) {
        throw new AppError("Failed to create WhatsApp ingestion event", 500, "DB_WRITE_FAILED", eventError);
      }

      await workflowEngine.runForRecord(supabaseAdmin, {
        orgId: integration.org_id,
        moduleId,
        dataRecordId: record.id,
        recordData: {
          record_type: "brsr_whatsapp_evidence",
          source_channel: "whatsapp_official",
          integration_id: integration.id,
          integration_name: integration.name,
          provider,
          message_id: message.message_id,
          from: message.from,
          from_name: message.from_name,
          message_type: message.message_type,
          text: message.text,
          caption: message.caption,
          media_url: message.media_url,
          mime_type: message.mime_type,
          file_name: message.file_name,
          timestamp: message.timestamp
        },
        actorUserId: null,
        triggerEvent: "record.completed"
      });

      // Run BRSR AI classification on WhatsApp text content
      const messageText = message.text || message.caption || "";
      if (messageText && messageText.length > 10) {
        const { data: moduleData } = await supabaseAdmin
          .from("modules")
          .select("code")
          .eq("id", moduleId)
          .single();

        if (moduleData && (moduleData.code === "brsr" || moduleData.code === "esg")) {
          await brsrExtractionService.processIngestedDocument(
            supabaseAdmin,
            { orgId: integration.org_id, userId: integration.org_id, role: "system", email: "whatsapp@enovait.local" },
            moduleId,
            messageText,
            `whatsapp_${message.from || message.message_id}`,
            record.id
          );
        }
      }

      recordIds.push(record.id);
      eventIds.push(event.id);
    }

    return {
      integration_id: integration.id,
      org_id: integration.org_id,
      module_id: moduleId,
      provider,
      message_count: messages.length,
      record_ids: recordIds,
      event_ids: eventIds,
      summary: {
        detail: `${messages.length} WhatsApp message${messages.length === 1 ? "" : "s"} ingested into live evidence`,
        first_message: messages[0]
      }
    };
  }
};
