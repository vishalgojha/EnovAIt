import { env } from "../../config.js";
import { AppError } from "../../lib/errors.js";

const normalizePhone = (value: string): string => value.replace(/[^\d]/g, "");

export const whatsappOfficialService = {
  async sendText(to: string, message: string): Promise<{ provider: "official"; message_id: string | null }> {
    if (!env.WHATSAPP_META_ACCESS_TOKEN || !env.WHATSAPP_META_PHONE_NUMBER_ID) {
      throw new AppError(
        "Official WhatsApp API is not configured. Set WHATSAPP_META_ACCESS_TOKEN and WHATSAPP_META_PHONE_NUMBER_ID.",
        400,
        "WHATSAPP_OFFICIAL_NOT_CONFIGURED"
      );
    }

    const phone = normalizePhone(to);
    if (!phone) {
      throw new AppError("Invalid recipient phone number", 400, "INVALID_PHONE_NUMBER");
    }

    const url = `https://graph.facebook.com/${env.WHATSAPP_META_API_VERSION}/${env.WHATSAPP_META_PHONE_NUMBER_ID}/messages`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_META_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "text",
        text: {
          body: message
        }
      })
    });

    const raw = await response.text();
    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      parsed = null;
    }

    if (!response.ok) {
      throw new AppError("Official WhatsApp API send failed", response.status, "WHATSAPP_OFFICIAL_SEND_FAILED", parsed ?? raw);
    }

    const messageId = Array.isArray(parsed?.messages)
      ? ((parsed?.messages as Array<Record<string, unknown>>)[0]?.id as string | undefined) ?? null
      : null;

    return {
      provider: "official",
      message_id: messageId
    };
  },

  verifyWebhook(mode: string, verifyToken: string, challenge: string): string {
    if (!env.WHATSAPP_META_VERIFY_TOKEN) {
      throw new AppError("WHATSAPP_META_VERIFY_TOKEN is not configured", 500, "WHATSAPP_VERIFY_NOT_CONFIGURED");
    }

    if (mode !== "subscribe" || verifyToken !== env.WHATSAPP_META_VERIFY_TOKEN) {
      throw new AppError("Webhook verification failed", 403, "WHATSAPP_WEBHOOK_VERIFICATION_FAILED");
    }

    return challenge;
  },

  summarizeWebhookPayload(payload: unknown): { message_count: number; statuses_count: number } {
    const root = payload as {
      entry?: Array<{ changes?: Array<{ value?: { messages?: unknown[]; statuses?: unknown[] } }> }>;
    };

    const entries = Array.isArray(root?.entry) ? root.entry : [];

    let messages = 0;
    let statuses = 0;

    for (const entry of entries) {
      const changes = Array.isArray(entry.changes) ? entry.changes : [];
      for (const change of changes) {
        const value = change.value;
        if (Array.isArray(value?.messages)) {
          messages += value.messages.length;
        }
        if (Array.isArray(value?.statuses)) {
          statuses += value.statuses.length;
        }
      }
    }

    return { message_count: messages, statuses_count: statuses };
  }
};
