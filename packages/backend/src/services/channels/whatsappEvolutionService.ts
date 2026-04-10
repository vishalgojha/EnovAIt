import { randomUUID } from "crypto";

import { supabaseAdmin } from "../../lib/supabase.js";
import { AppError } from "../../lib/errors.js";
import { brsrExtractionService } from "../extraction/brsrExtractionService.js";
import { workflowEngine } from "../workflow/workflowEngine.js";

const readEnv = () => {
  const baseUrl = process.env.EVOLUTION_API_BASE_URL?.trim();
  const apiKey = process.env.EVOLUTION_API_KEY?.trim();
  return { baseUrl, apiKey };
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const asString = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : null;

const normalizePhone = (value: string): string => value.replace(/[^\d]/g, "");

const getBaseUrl = (): string => {
  const { baseUrl } = readEnv();
  if (!baseUrl) {
    throw new AppError("EVOLUTION_API_BASE_URL is not configured", 400, "EVOLUTION_NOT_CONFIGURED");
  }
  return baseUrl.replace(/\/$/, "");
};

const getApiKey = (): string => {
  const { apiKey } = readEnv();
  if (!apiKey) {
    throw new AppError("EVOLUTION_API_KEY is not configured", 400, "EVOLUTION_NOT_CONFIGURED");
  }
  return apiKey;
};

const requestJson = async (url: string, init: RequestInit): Promise<Record<string, unknown>> => {
  const response = await fetch(url, init);
  const raw = await response.text();
  let parsed: Record<string, unknown> = {};

  if (raw) {
    try {
      parsed = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      parsed = { raw };
    }
  }

  if (!response.ok) {
    throw new AppError("Evolution API request failed", response.status, "EVOLUTION_API_ERROR", parsed);
  }

  return parsed;
};

const resolveModuleId = async (orgId: string): Promise<string> => {
  const { data, error } = await supabaseAdmin
    .from("modules")
    .select("id, code, name")
    .eq("org_id", orgId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    throw new AppError("Failed to resolve modules for Evolution API", 500, "DB_READ_FAILED", error);
  }

  const modules = data ?? [];
  const preferred =
    modules.find((module) => module.code === "brsr_india") ||
    modules.find((module) => module.code === "brsr") ||
    modules.find((module) => module.code === "esg") ||
    modules[0];

  if (!preferred) {
    throw new AppError("No active module available for WhatsApp Evolution", 400, "MODULE_NOT_FOUND");
  }

  return preferred.id;
};

const resolveIntegration = async (orgId?: string, integrationId?: string) => {
  const query = supabaseAdmin
    .from("integrations")
    .select("id, org_id, module_id, integration_type, name, config, is_active")
    .eq("integration_type", "whatsapp_evolution")
    .eq("is_active", true);

  if (integrationId) {
    const { data, error } = await query.eq("id", integrationId).single();
    if (error || !data) {
      throw new AppError("WhatsApp Evolution integration not found", 404, "INTEGRATION_NOT_FOUND", error);
    }
    return data as {
      id: string;
      org_id: string;
      module_id: string | null;
      config: Record<string, unknown>;
      name: string;
    };
  }

  if (!orgId) {
    throw new AppError("Organization context is required for Evolution API", 400, "ORG_REQUIRED");
  }

  const { data, error } = await query.eq("org_id", orgId).order("created_at", { ascending: true }).limit(1).single();
  if (error || !data) {
    throw new AppError("No active WhatsApp Evolution integration available", 400, "INTEGRATION_NOT_FOUND", error);
  }

  return data as {
    id: string;
    org_id: string;
    module_id: string | null;
    config: Record<string, unknown>;
    name: string;
  };
};

const resolveInstance = (integration: { config: Record<string, unknown>; name: string }): string => {
  const config = integration.config ?? {};
  const instance =
    asString(config.instance_name) ||
    asString(config.instanceName) ||
    asString(config.instance) ||
    asString(config.whatsapp_instance) ||
    asString(integration.name);

  if (!instance) {
    throw new AppError("Evolution instance name is required", 400, "EVOLUTION_INSTANCE_REQUIRED");
  }

  return instance;
};

const getConnectionState = (payload: Record<string, unknown>): string => {
  const data = asRecord(payload.data);
  return (
    asString(payload.state) ||
    asString(payload.connectionState) ||
    asString(payload.connection_state) ||
    asString(data.state) ||
    asString(data.connectionState) ||
    asString(data.connection_state) ||
    "unknown"
  );
};

const getSendBody = (to: string, message: string): Record<string, unknown> => ({
  number: normalizePhone(to),
  text: message
});

const flattenEvolutionWebhook = (payload: unknown) => {
  const root = asRecord(payload);
  const data = asRecord(root.data);
  const event = asString(root.event) || asString(data.event) || "messages.upsert";
  const sourceMessage = asRecord(data.message);
  const key = asRecord(data.key);

  const text =
    asString(sourceMessage.conversation) ||
    asString(asRecord(sourceMessage.extendedTextMessage).text) ||
    asString(asRecord(sourceMessage.imageMessage).caption) ||
    asString(asRecord(sourceMessage.videoMessage).caption) ||
    asString(asRecord(sourceMessage.documentMessage).caption) ||
    asString(data.text) ||
    asString(data.body);

  const media =
    asRecord(sourceMessage.imageMessage) ||
    asRecord(sourceMessage.videoMessage) ||
    asRecord(sourceMessage.documentMessage) ||
    asRecord(sourceMessage.audioMessage);

  const fileName =
    asString(asRecord(sourceMessage.documentMessage).fileName) ||
    asString(asRecord(sourceMessage.documentMessage).filename) ||
    asString(data.file_name) ||
    asString(data.fileName);

  return [
    {
      message_id: asString(key.id) || asString(data.id) || randomUUID(),
      from: asString(data.sender) || asString(key.remoteJid),
      from_name: asString(data.pushName) || asString(root.pushName),
      message_type: asString(data.messageType) || event,
      text,
      caption:
        asString(asRecord(sourceMessage.imageMessage).caption) ||
        asString(asRecord(sourceMessage.videoMessage).caption) ||
        asString(asRecord(sourceMessage.documentMessage).caption),
      media_url: asString(media.url) || asString(media.link) || asString(data.mediaUrl),
      mime_type: asString(media.mimetype) || asString(media.mime_type) || asString(data.mime_type),
      file_name: fileName,
      timestamp: asString(data.date_time) || (typeof data.messageTimestamp === "number" ? new Date(Number(data.messageTimestamp) * 1000).toISOString() : null),
      raw: root
    }
  ];
};

const flattenGenericWebhook = (payload: unknown) => {
  const root = asRecord(payload);
  const messages: Array<{
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
  }> = [];

  if (root.message && typeof root.message === "object") {
    const message = asRecord(root.message);
    messages.push({
      message_id: asString(message.id) || randomUUID(),
      from: asString(message.from),
      from_name: asString(message.pushName),
      message_type: asString(message.type) || "messages.upsert",
      text: asString(message.text) || asString(message.body),
      caption: asString(message.caption),
      media_url: asString(message.url) || asString(message.media_url),
      mime_type: asString(message.mime_type),
      file_name: asString(message.file_name),
      timestamp: asString(message.timestamp),
      raw: message
    });
  }

  if (Array.isArray(root.messages)) {
    for (const item of root.messages as Array<Record<string, unknown>>) {
      messages.push({
        message_id: asString(item.id) || randomUUID(),
        from: asString(item.from),
        from_name: asString(item.from_name),
        message_type: asString(item.type) || "messages.upsert",
        text: asString(item.text) || asString(item.body),
        caption: asString(item.caption),
        media_url: asString(item.url) || asString(item.media_url),
        mime_type: asString(item.mime_type),
        file_name: asString(item.file_name),
        timestamp: asString(item.timestamp),
        raw: item
      });
    }
  }

  return messages;
};

export const whatsappEvolutionService = {
  async sendText(input: { orgId: string; to: string; message: string; integrationId?: string }) {
    const integration = await resolveIntegration(input.orgId, input.integrationId);
    const instance = resolveInstance(integration);
    const url = `${getBaseUrl()}/message/sendText/${instance}`;

    const response = await requestJson(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: getApiKey()
      },
      body: JSON.stringify(getSendBody(input.to, input.message))
    });

    const key = asRecord(response.key);
    return {
      provider: "evolution" as const,
      instance,
      message_id: asString(key.id) || asString(response.id) || null
    };
  },

  async getStatus(input?: { orgId?: string; integrationId?: string }) {
    const baseUrl = getBaseUrl();
    const apiKey = getApiKey();
    const integration = await resolveIntegration(input?.orgId, input?.integrationId);
    const instance = resolveInstance(integration);

    const payload = await requestJson(`${baseUrl}/instance/connectionState/${instance}`, {
      method: "GET",
      headers: {
        apikey: apiKey
      }
    });

    const state = getConnectionState(payload);
    return {
      provider: "evolution" as const,
      configured: true,
      connected: state === "open" || state === "connected",
      connection_state: state,
      instance_name: instance,
      detail: state
    };
  },

  async ingestWebhook(payload: unknown, integrationId?: string) {
    const integration = await resolveIntegration(undefined, integrationId);
    const moduleId = integration.module_id ?? (await resolveModuleId(integration.org_id));
    const messages = flattenEvolutionWebhook(payload);

    if (!messages.length) {
      const generic = flattenGenericWebhook(payload);
      messages.push(...generic);
    }

    if (!messages.length) {
      return {
        integration_id: integration.id,
        org_id: integration.org_id,
        module_id: moduleId,
        provider: "evolution" as const,
        message_count: 0,
        record_ids: [],
        event_ids: [],
        summary: { detail: "No inbound Evolution payload matched a WhatsApp message" }
      };
    }

    const recordIds: string[] = [];
    const eventIds: string[] = [];

    for (const message of messages) {
      const normalizedKey = `${integration.id}:${message.message_id}`;
      const recordResult = await supabaseAdmin
        .from("data_records")
        .insert({
          org_id: integration.org_id,
          module_id: moduleId,
          record_type: "brsr_whatsapp_evidence",
          title: `WhatsApp ${message.from_name || message.from || "Evolution"} - ${(message.text || message.caption || message.file_name || "message").slice(0, 48)}`,
          normalized_key: normalizedKey,
          source_channel: "whatsapp_evolution",
          status: "final",
          data: {
            integration_id: integration.id,
            integration_name: integration.name,
            provider: "evolution",
            record_type: "brsr_whatsapp_evidence",
            source_channel: "whatsapp_evolution",
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

      if (recordResult.error || !recordResult.data) {
        throw new AppError("Failed to create WhatsApp Evolution evidence record", 500, "DB_WRITE_FAILED", recordResult.error);
      }

      const eventResult = await supabaseAdmin
        .from("workflow_events")
        .insert({
          org_id: integration.org_id,
          module_id: moduleId,
          data_record_id: recordResult.data.id,
          event_type: "ingestion.whatsapp.received",
          payload: {
            integration_id: integration.id,
            integration_name: integration.name,
            provider: "evolution",
            message_id: message.message_id,
            from: message.from,
            from_name: message.from_name,
            message_type: message.message_type,
            text_preview: (message.text || message.caption || message.file_name || "WhatsApp evidence").slice(0, 400),
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

      if (eventResult.error || !eventResult.data) {
        throw new AppError("Failed to create WhatsApp Evolution event", 500, "DB_WRITE_FAILED", eventResult.error);
      }

      await workflowEngine.runForRecord(supabaseAdmin, {
        orgId: integration.org_id,
        moduleId,
        dataRecordId: recordResult.data.id,
        recordData: {
          record_type: "brsr_whatsapp_evidence",
          source_channel: "whatsapp_evolution",
          integration_id: integration.id,
          integration_name: integration.name,
          provider: "evolution",
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
            `whatsapp_evolution_${message.from || message.message_id}`,
            recordResult.data.id
          );
        }
      }

      recordIds.push(recordResult.data.id);
      eventIds.push(eventResult.data.id);
    }

    return {
      integration_id: integration.id,
      org_id: integration.org_id,
      module_id: moduleId,
      provider: "evolution" as const,
      message_count: messages.length,
      record_ids: recordIds,
      event_ids: eventIds,
      summary: {
        detail: `${messages.length} Evolution WhatsApp message${messages.length === 1 ? "" : "s"} ingested into live evidence`,
        first_message: messages[0]
      }
    };
  }
};
