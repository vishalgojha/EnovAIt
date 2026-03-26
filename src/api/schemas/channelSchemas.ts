import { z } from "zod";

export const WhatsAppSendRequestSchema = z.object({
  provider: z.enum(["official", "baileys"]),
  to: z.string().min(6).max(30),
  message: z.string().min(1).max(4096)
});

export const OfficialWebhookVerifyQuerySchema = z.object({
  "hub.mode": z.string(),
  "hub.verify_token": z.string(),
  "hub.challenge": z.string()
});

export type WhatsAppSendRequest = z.infer<typeof WhatsAppSendRequestSchema>;
