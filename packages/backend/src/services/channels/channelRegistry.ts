import { randomUUID } from "crypto";

import type { SupportedChannel } from "../../api/schemas/channelSchemas.js";
import { env } from "../../config.js";
import { AppError } from "../../lib/errors.js";
import { whatsappBaileysService } from "./whatsappBaileysService.js";
import { whatsappOfficialService } from "./whatsappOfficialService.js";
import type { ChannelIngestResult, ChannelSendInput, ChannelSendResult, ChannelStatus } from "./types.js";

const toJsonRecord = async (response: Response): Promise<Record<string, unknown>> => {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { raw: text };
  }
};

const postJson = async (
  url: string,
  headers: Record<string, string>,
  body: Record<string, unknown>
): Promise<Record<string, unknown>> => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    body: JSON.stringify(body)
  });

  const parsed = await toJsonRecord(response);
  if (!response.ok) {
    throw new AppError("Channel API call failed", response.status, "CHANNEL_API_ERROR", { url, parsed });
  }

  return parsed;
};

const getSlackConfig = (): { mode: "webhook" | "bot" | "none" } => {
  if (env.SLACK_WEBHOOK_URL) {
    return { mode: "webhook" };
  }
  if (env.SLACK_BOT_TOKEN) {
    return { mode: "bot" };
  }
  return { mode: "none" };
};

const sendSlack = async (input: ChannelSendInput): Promise<ChannelSendResult> => {
  const config = getSlackConfig();
  if (config.mode === "none") {
    throw new AppError("Slack is not configured", 400, "SLACK_NOT_CONFIGURED");
  }

  if (config.mode === "webhook") {
    await postJson(env.SLACK_WEBHOOK_URL as string, {}, { text: input.message, metadata: input.metadata });
    return {
      channel: "slack",
      accepted: true,
      external_id: null,
      detail: "Sent using Slack Incoming Webhook"
    };
  }

  const channel = input.to ?? env.SLACK_CHANNEL_DEFAULT;
  if (!channel) {
    throw new AppError("Slack destination channel is required", 400, "SLACK_CHANNEL_REQUIRED");
  }

  const response = await postJson(
    "https://slack.com/api/chat.postMessage",
    { Authorization: `Bearer ${env.SLACK_BOT_TOKEN as string}` },
    { channel, text: input.message }
  );

  if (response.ok !== true) {
    throw new AppError("Slack chat.postMessage failed", 502, "SLACK_SEND_FAILED", response);
  }

  return {
    channel: "slack",
    accepted: true,
    external_id: typeof response.ts === "string" ? response.ts : null,
    detail: `Sent to Slack channel ${channel}`
  };
};

const sendTeams = async (input: ChannelSendInput): Promise<ChannelSendResult> => {
  if (!env.MSTEAMS_WEBHOOK_URL) {
    throw new AppError("Microsoft Teams webhook is not configured", 400, "MSTEAMS_NOT_CONFIGURED");
  }

  await postJson(env.MSTEAMS_WEBHOOK_URL, {}, { text: input.message, summary: input.subject ?? "EnovAIt message" });
  return {
    channel: "msteams",
    accepted: true,
    external_id: null,
    detail: "Sent to Microsoft Teams webhook"
  };
};

const sendEmail = async (input: ChannelSendInput): Promise<ChannelSendResult> => {
  if (!env.EMAIL_SMTP_HOST || !env.EMAIL_FROM) {
    throw new AppError("Email SMTP is not configured", 400, "EMAIL_NOT_CONFIGURED");
  }

  if (!input.to) {
    throw new AppError("Email recipient is required", 400, "EMAIL_TO_REQUIRED");
  }

  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: env.EMAIL_SMTP_HOST,
    port: env.EMAIL_SMTP_PORT,
    secure: env.EMAIL_SMTP_PORT === 465,
    auth:
      env.EMAIL_SMTP_USER && env.EMAIL_SMTP_PASS
        ? {
            user: env.EMAIL_SMTP_USER,
            pass: env.EMAIL_SMTP_PASS
          }
        : undefined
  });

  const info = await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: input.to,
    subject: input.subject ?? "EnovAIt notification",
    text: input.message
  });

  return {
    channel: "email",
    accepted: true,
    external_id: info.messageId ?? null,
    detail: `Email queued for ${input.to}`
  };
};

const twilioAuthHeader = (): string => {
  const raw = `${env.TWILIO_ACCOUNT_SID as string}:${env.TWILIO_AUTH_TOKEN as string}`;
  return `Basic ${Buffer.from(raw, "utf-8").toString("base64")}`;
};

const sendSms = async (input: ChannelSendInput): Promise<ChannelSendResult> => {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_SMS_FROM) {
    throw new AppError("Twilio SMS is not configured", 400, "SMS_NOT_CONFIGURED");
  }

  if (!input.to) {
    throw new AppError("SMS recipient is required", 400, "SMS_TO_REQUIRED");
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`;
  const form = new URLSearchParams({
    From: env.TWILIO_SMS_FROM,
    To: input.to,
    Body: input.message
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: twilioAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: form.toString()
  });

  const parsed = await toJsonRecord(response);
  if (!response.ok) {
    throw new AppError("Twilio SMS send failed", response.status, "SMS_SEND_FAILED", parsed);
  }

  return {
    channel: "sms",
    accepted: true,
    external_id: typeof parsed.sid === "string" ? parsed.sid : null,
    detail: `SMS sent to ${input.to}`
  };
};

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const sendVoiceIvr = async (input: ChannelSendInput): Promise<ChannelSendResult> => {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_VOICE_FROM) {
    throw new AppError("Twilio Voice is not configured", 400, "VOICE_NOT_CONFIGURED");
  }

  if (!input.to) {
    throw new AppError("Voice recipient is required", 400, "VOICE_TO_REQUIRED");
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Calls.json`;
  const form = new URLSearchParams({
    From: env.TWILIO_VOICE_FROM,
    To: input.to
  });

  if (env.TWILIO_VOICE_TWIML_URL) {
    form.set("Url", env.TWILIO_VOICE_TWIML_URL);
  } else {
    form.set("Twiml", `<Response><Say>${escapeXml(input.message)}</Say></Response>`);
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: twilioAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: form.toString()
  });

  const parsed = await toJsonRecord(response);
  if (!response.ok) {
    throw new AppError("Twilio Voice call failed", response.status, "VOICE_SEND_FAILED", parsed);
  }

  return {
    channel: "voice_ivr",
    accepted: true,
    external_id: typeof parsed.sid === "string" ? parsed.sid : null,
    detail: `Voice call initiated for ${input.to}`
  };
};

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

  const response = await postJson(url, {}, {
    channel,
    to: input.to ?? null,
    subject: input.subject ?? null,
    message: input.message,
    metadata: input.metadata,
    sent_at: new Date().toISOString()
  });

  const externalId =
    typeof response.id === "string" ? response.id : typeof response.reference === "string" ? response.reference : null;

  return {
    channel,
    accepted: true,
    external_id: externalId,
    detail: `Forwarded to ${channel} webhook`
  };
};

const sendInternalChannel = (channel: "web_widget" | "mobile_sdk", input: ChannelSendInput): ChannelSendResult => {
  const eventId = randomUUID();
  return {
    channel,
    accepted: true,
    external_id: eventId,
    detail: `${channel} event accepted (${input.message.length} chars)`
  };
};

const isConfigured = (channel: SupportedChannel): boolean => {
  switch (channel) {
    case "whatsapp_official":
      return Boolean(env.WHATSAPP_META_ACCESS_TOKEN && env.WHATSAPP_META_PHONE_NUMBER_ID);
    case "whatsapp_baileys":
      return true;
    case "email":
      return Boolean(env.EMAIL_SMTP_HOST && env.EMAIL_FROM);
    case "slack":
      return Boolean(env.SLACK_WEBHOOK_URL || env.SLACK_BOT_TOKEN);
    case "msteams":
      return Boolean(env.MSTEAMS_WEBHOOK_URL);
    case "web_widget":
      return true;
    case "mobile_sdk":
      return true;
    case "sms":
      return Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_SMS_FROM);
    case "voice_ivr":
      return Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_VOICE_FROM);
    case "iot_mqtt":
      return Boolean(env.IOT_MQTT_URL && env.IOT_MQTT_TOPIC_DEFAULT);
    case "erp_crm":
      return Boolean(env.ERP_CRM_WEBHOOK_URL);
    case "api_partner":
      return Boolean(env.API_PARTNER_WEBHOOK_URL);
    default:
      return false;
  }
};

export const channelRegistry = {
  async send(channel: SupportedChannel, input: ChannelSendInput): Promise<ChannelSendResult> {
    switch (channel) {
      case "whatsapp_official": {
        if (!input.to) {
          throw new AppError("Recipient phone is required for whatsapp_official", 400, "TO_REQUIRED");
        }
        const result = await whatsappOfficialService.sendText(input.to, input.message);
        return {
          channel,
          accepted: true,
          external_id: result.message_id,
          detail: "Sent via WhatsApp Official API"
        };
      }
      case "whatsapp_baileys": {
        if (!input.to) {
          throw new AppError("Recipient phone is required for whatsapp_baileys", 400, "TO_REQUIRED");
        }
        const result = await whatsappBaileysService.sendText(input.to, input.message);
        return {
          channel,
          accepted: true,
          external_id: result.jid,
          detail: "Sent via WhatsApp Baileys"
        };
      }
      case "email":
        return sendEmail(input);
      case "slack":
        return sendSlack(input);
      case "msteams":
        return sendTeams(input);
      case "web_widget":
        return sendInternalChannel(channel, input);
      case "mobile_sdk":
        return sendInternalChannel(channel, input);
      case "sms":
        return sendSms(input);
      case "voice_ivr":
        return sendVoiceIvr(input);
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

  async status(channel: SupportedChannel): Promise<ChannelStatus> {
    if (channel === "whatsapp_baileys") {
      try {
        const status = await whatsappBaileysService.getStatus();
        return {
          channel,
          configured: true,
          healthy: status.connected,
          detail: `state=${status.connection_state}`
        };
      } catch (error) {
        return {
          channel,
          configured: true,
          healthy: false,
          detail: `state=error (${error instanceof Error ? error.message : "unknown"})`
        };
      }
    }

    const configured = isConfigured(channel);
    return {
      channel,
      configured,
      healthy: configured,
      detail: configured ? "configured" : "not configured"
    };
  },

  async ingest(channel: SupportedChannel, payload: unknown): Promise<ChannelIngestResult> {
    if (channel === "whatsapp_official") {
      const summary = whatsappOfficialService.summarizeWebhookPayload(payload);
      return {
        channel,
        received: true,
        summary
      };
    }

    const event = payload as { challenge?: string; type?: string; events?: unknown[] };
    const summary: Record<string, unknown> = {
      type: event?.type ?? null,
      has_challenge: typeof event?.challenge === "string",
      event_count: Array.isArray(event?.events) ? event.events.length : null
    };

    if (channel === "slack" && typeof event?.challenge === "string") {
      summary.challenge = event.challenge;
    }

    return {
      channel,
      received: true,
      summary
    };
  }
};
