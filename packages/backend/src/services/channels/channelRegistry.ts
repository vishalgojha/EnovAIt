import type { SupportedChannel } from "../../api/schemas/channelSchemas.js";
import { env } from "../../config.js";
import { AppError } from "../../lib/errors.js";
import { whatsappBaileysService } from "./whatsappBaileysService.js";
import type { ChannelIngestResult, ChannelSendInput, ChannelSendResult, ChannelStatus } from "./types.js";

const sendIotMqtt = async (input: ChannelSendInput): Promise<ChannelSendResult> => {
  if (!env.IOT_MQTT_URL) {
    throw new AppError("MQTT integration is not configured", 400, "IOT_NOT_CONFIGURED");
  }

  const mqtt = await import("mqtt");
  const topic = input.to ?? env.IOT_MQTT_TOPIC_DEFAULT;
  if (!topic) {
    throw new AppError("MQTT topic is required", 400, "IOT_TOPIC_REQUIRED");
  }

  const client = mqtt.connect(env.IOT_MQTT_URL, {
    username: env.IOT_MQTT_USERNAME,
    password: env.IOT_MQTT_PASSWORD
  });

  await new Promise<void>((resolve, reject) => {
    client.once("connect", () => resolve());
    client.once("error", (error: Error) => reject(error));
  });

  const payload = JSON.stringify({
    message: input.message,
    metadata: input.metadata,
    sent_at: new Date().toISOString()
  });

  await new Promise<void>((resolve, reject) => {
    client.publish(topic, payload, {}, (error?: Error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });

  client.end(true);

  return {
    channel: "iot_mqtt",
    accepted: true,
    external_id: null,
    detail: `MQTT payload published to ${topic}`
  };
};

const sendWebhookBridge = async (
  channel: "erp_crm" | "api_partner",
  url: string | undefined,
  input: ChannelSendInput
): Promise<ChannelSendResult> => {
  if (!url) {
    throw new AppError(`${channel} webhook is not configured`, 400, "WEBHOOK_NOT_CONFIGURED");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      channel,
      to: input.to ?? null,
      subject: input.subject ?? null,
      message: input.message,
      metadata: input.metadata,
      sent_at: new Date().toISOString()
    })
  });

  if (!response.ok) {
    throw new AppError(`${channel} webhook failed`, response.status, "WEBHOOK_SEND_FAILED");
  }

  const parsed = await response.json().catch(() => ({}));
  const externalId =
    typeof parsed.id === "string" ? parsed.id :
    typeof parsed.reference === "string" ? parsed.reference :
    null;

  return {
    channel,
    accepted: true,
    external_id: externalId,
    detail: `Forwarded to ${channel} webhook`
  };
};

const sendInternalChannel = (channel: "web_widget" | "mobile_sdk", input: ChannelSendInput): ChannelSendResult => {
  const eventId = crypto.randomUUID();
  return {
    channel,
    accepted: true,
    external_id: eventId,
    detail: `${channel} event accepted (${input.message.length} chars)`
  };
};

export const channelRegistry = {
  async send(channel: SupportedChannel, input: ChannelSendInput): Promise<ChannelSendResult> {
    switch (channel) {
      case "whatsapp_baileys": {
        if (!input.to) {
          throw new AppError("Recipient phone is required for whatsapp_baileys", 400, "TO_REQUIRED");
        }
        if (!input.orgId) {
          throw new AppError("Organization context is required for whatsapp_baileys", 400, "ORG_REQUIRED");
        }
        const result = await whatsappBaileysService.sendText({
          orgId: input.orgId,
          to: input.to,
          message: input.message
        });
        return {
          channel,
          accepted: true,
          external_id: result.jid,
          detail: "Sent via WhatsApp Baileys"
        };
      }
      case "web_widget":
        return sendInternalChannel(channel, input);
      case "mobile_sdk":
        return sendInternalChannel(channel, input);
      case "sms":
        throw new AppError("SMS channel is not configured", 400, "SMS_NOT_CONFIGURED");
      case "voice_ivr":
        throw new AppError("Voice IVR channel is not configured", 400, "VOICE_NOT_CONFIGURED");
      case "iot_mqtt":
        return sendIotMqtt(input);
      case "erp_crm":
        return sendWebhookBridge(channel, env.ERP_CRM_WEBHOOK_URL, input);
      case "api_partner":
        return sendWebhookBridge(channel, env.API_PARTNER_WEBHOOK_URL, input);
      default:
        throw new AppError(`Unsupported channel: ${channel}`, 400, "UNSUPPORTED_CHANNEL");
    }
  },

  async status(channel: SupportedChannel, context?: { orgId?: string }): Promise<ChannelStatus> {
    if (channel === "whatsapp_baileys") {
      if (!context?.orgId) {
        return {
          channel,
          configured: false,
          healthy: false,
          detail: "org context required"
        };
      }

      try {
        const status = await whatsappBaileysService.getStatus(context.orgId);
        return {
          channel,
          configured: true,
          healthy: status.connected,
          detail: `state=${status.connection_state}`
        };
      } catch (error) {
        const configured = !(error instanceof AppError && error.code === "SUPABASE_NOT_CONFIGURED");
        return {
          channel,
          configured,
          healthy: false,
          detail: `state=error (${error instanceof Error ? error.message : "unknown"})`
        };
      }
    }

    const configuredChannels: Record<string, boolean> = {
      "whatsapp_baileys": true,
      "web_widget": true,
      "mobile_sdk": true,
      "iot_mqtt": Boolean(env.IOT_MQTT_URL),
      "erp_crm": Boolean(env.ERP_CRM_WEBHOOK_URL),
      "api_partner": Boolean(env.API_PARTNER_WEBHOOK_URL)
    };

    const configured = configuredChannels[channel] ?? false;
    return {
      channel,
      configured,
      healthy: configured,
      detail: configured ? "configured" : "not configured"
    };
  },

  async ingest(channel: SupportedChannel, payload: unknown): Promise<ChannelIngestResult> {
    if (channel === "whatsapp_baileys" && typeof (payload as any)?.challenge === "string") {
      return {
        channel,
        received: true,
        summary: { challenge: (payload as any).challenge }
      };
    }

    return {
      channel,
      received: true,
      summary: { detail: "Generic webhook received" }
    };
  }
};
