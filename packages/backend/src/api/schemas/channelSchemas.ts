import { z } from "zod";

export const SupportedChannelEnum = z.enum([
  "whatsapp_official",
  "whatsapp_evolution",
  "whatsapp_baileys",
  "email",
  "slack",
  "msteams",
  "web_widget",
  "mobile_sdk",
  "sms",
  "voice_ivr",
  "iot_mqtt",
  "erp_crm",
  "api_partner"
]);

export const ChannelSendRequestSchema = z.object({
  channel: SupportedChannelEnum,
  to: z.string().min(2).max(255).optional(),
  subject: z.string().min(1).max(255).optional(),
  message: z.string().min(1).max(8000),
  metadata: z.record(z.string(), z.unknown()).default({})
});

export const ChannelStatusParamSchema = z.object({
  channel: SupportedChannelEnum
});

export const ChannelWebhookParamSchema = z.object({
  channel: SupportedChannelEnum
});

export const WhatsAppSendRequestSchema = z.object({
  provider: z.enum(["official", "evolution", "baileys"]),
  to: z.string().min(6).max(30),
  message: z.string().min(1).max(4096)
});

export const OfficialWebhookVerifyQuerySchema = z.object({
  "hub.mode": z.string(),
  "hub.verify_token": z.string(),
  "hub.challenge": z.string()
});

export const WhatsAppWebhookPathSchema = z.object({
  integrationId: z.string().uuid().optional()
});

export type SupportedChannel = z.infer<typeof SupportedChannelEnum>;
export type ChannelSendRequest = z.infer<typeof ChannelSendRequestSchema>;
export type WhatsAppSendRequest = z.infer<typeof WhatsAppSendRequestSchema>;
