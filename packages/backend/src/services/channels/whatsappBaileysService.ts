import fs from "fs";
import path from "path";

import {
  SessionManager,
  SupabaseStorageAdapter,
  type SessionSnapshot
} from "@vishalgojha/whatsapp-baileys-runtime";

import { env } from "../../config.js";
import { AppError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";
import { getSupabaseAdmin, isSupabaseConfigured } from "../../lib/supabase.js";
import { whatsappIngestionService } from "./whatsappIngestionService.js";

type ManagedSession = NonNullable<Awaited<ReturnType<SessionManager["createSession"]>>>;

let sessionManagerPromise: Promise<SessionManager> | null = null;
const sessionEnsurePromises = new Map<string, Promise<ManagedSession>>();

const normalizeJid = (value: string): string => {
  if (value.includes("@")) {
    return value;
  }

  const phone = value.replace(/[^\d]/g, "");
  if (!phone) {
    throw new AppError("Invalid recipient phone number", 400, "INVALID_PHONE_NUMBER");
  }

  return `${phone}@s.whatsapp.net`;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" ? (value as Record<string, unknown>) : {};

const getSessionLabel = (): string => env.WHATSAPP_BAILEYS_DEFAULT_LABEL;

const getSessionRoot = (): string => path.resolve(env.WHATSAPP_BAILEYS_SESSION_PATH);

const buildSessionKey = (orgId: string, label: string): string => `${orgId}:${label}`;

const getSessionPath = (orgId: string, label: string): string =>
  path.join(getSessionRoot(), `${orgId}_${label}`);

const getRawMessageId = (payload: unknown): string | null => {
  const record = asRecord(payload);
  const key = asRecord(record.key);
  return typeof key.id === "string" && key.id.trim().length > 0 ? key.id : null;
};

const createSessionManager = async (): Promise<SessionManager> => {
  if (!isSupabaseConfigured()) {
    throw new AppError(
      "Supabase must be configured to use the WhatsApp Baileys runtime.",
      503,
      "SUPABASE_NOT_CONFIGURED"
    );
  }

  const manager = new SessionManager({
    storage: new SupabaseStorageAdapter({
      supabaseUrl: env.SUPABASE_URL,
      supabaseKey: env.SUPABASE_SERVICE_ROLE_KEY,
      sessionsTable: "whatsapp_sessions",
      messagesTable: "whatsapp_messages"
    }),
    sessionRoot: getSessionRoot(),
    hooks: {
      onConnectionUpdate(event) {
        logger.info(
          {
            orgId: event.tenantId,
            label: event.label,
            status: event.status,
            phoneNumber: event.phoneNumber ?? null
          },
          "WhatsApp Baileys session updated"
        );
      },
      onError(event) {
        logger.error(
          {
            orgId: event.tenantId,
            label: event.label,
            stage: event.stage,
            error: event.error
          },
          "WhatsApp Baileys runtime error"
        );
      },
      async onMessage(event) {
        try {
          await whatsappIngestionService.ingestWebhook(
            {
              message: {
                id: getRawMessageId(event.rawMessage) ?? undefined,
                from: event.remoteJid,
                sender_name: event.sender ?? null,
                text: event.text,
                timestamp: event.timestamp,
                type: "text",
                raw_message: event.rawMessage,
                from_me: event.fromMe
              }
            },
            undefined,
            "baileys"
          );
        } catch (error) {
          logger.error(
            {
              orgId: event.tenantId,
              label: event.label,
              remoteJid: event.remoteJid,
              error
            },
            "Failed to ingest inbound WhatsApp Baileys message"
          );
        }
      }
    }
  });

  await manager.rehydratePersistedSessions();
  return manager;
};

const getSessionManager = async (): Promise<SessionManager> => {
  if (!sessionManagerPromise) {
    sessionManagerPromise = createSessionManager().catch((error) => {
      sessionManagerPromise = null;
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to initialize WhatsApp Baileys runtime.", 500, "WHATSAPP_BAILEYS_INIT_FAILED", error);
    });
  }

  return sessionManagerPromise;
};

const ensureSession = async (orgId: string): Promise<{ manager: SessionManager; session: ManagedSession; label: string }> => {
  const manager = await getSessionManager();
  const label = getSessionLabel();
  const existingSession = await manager.getSession(orgId, label);

  if (existingSession) {
    return { manager, session: existingSession, label };
  }

  const key = buildSessionKey(orgId, label);
  let pendingSession = sessionEnsurePromises.get(key);
  if (!pendingSession) {
    pendingSession = manager.createSession(orgId, {
      label,
      ownerName: env.WHATSAPP_BAILEYS_OWNER_NAME
    }) as Promise<ManagedSession>;
    sessionEnsurePromises.set(key, pendingSession);
  }

  try {
    const session = await pendingSession;
    return { manager, session, label };
  } finally {
    sessionEnsurePromises.delete(key);
  }
};

const clearStoredSession = async (orgId: string, label: string): Promise<void> => {
  const sessionPath = getSessionPath(orgId, label);
  if (fs.existsSync(sessionPath)) {
    fs.rmSync(sessionPath, { recursive: true, force: true });
  }

  const { error } = await getSupabaseAdmin()
    .from("whatsapp_sessions")
    .delete()
    .eq("tenant_id", orgId)
    .eq("label", label);

  if (error) {
    throw new AppError("Failed to clear stored WhatsApp session.", 500, "DB_WRITE_FAILED", error);
  }
};

const toStatusPayload = (
  snapshot: SessionSnapshot,
  qr: string | null
): {
  provider: "baileys";
  connected: boolean;
  connection_state: string;
  user_id: string | null;
  phone_number: string | null;
  session_label: string;
  qr_available: boolean;
} => ({
  provider: "baileys",
  connected: snapshot.status === "connected",
  connection_state: snapshot.status,
  user_id: snapshot.phoneNumber ?? null,
  phone_number: snapshot.phoneNumber ?? null,
  session_label: snapshot.label,
  qr_available: Boolean(qr)
});

export const whatsappBaileysService = {
  async sendText(input: { orgId: string; to: string; message: string }): Promise<{ provider: "baileys"; jid: string; label: string }> {
    const { session, label } = await ensureSession(input.orgId);
    const jid = normalizeJid(input.to);

    try {
      await session.sendMessage(jid, input.message);
    } catch (error) {
      if (error instanceof Error && /not connected/i.test(error.message)) {
        throw new AppError(
          "WhatsApp is not connected yet. Scan the QR code in Channels before sending a message.",
          409,
          "WHATSAPP_BAILEYS_NOT_CONNECTED",
          error
        );
      }

      throw new AppError("Failed to send WhatsApp message through Baileys.", 502, "WHATSAPP_BAILEYS_SEND_FAILED", error);
    }

    return {
      provider: "baileys",
      jid,
      label
    };
  },

  async getStatus(orgId: string): Promise<{
    provider: "baileys";
    connected: boolean;
    connection_state: string;
    user_id: string | null;
    phone_number: string | null;
    session_label: string;
    qr_available: boolean;
  }> {
    const { manager, session, label } = await ensureSession(orgId);
    const qr = manager.getQR(orgId, label) ?? null;
    return toStatusPayload(session.getStatusSnapshot(), qr);
  },

  async getQrCode(orgId: string): Promise<{
    qr: string | null;
    connection_state: string;
    connected: boolean;
    session_label: string;
  }> {
    const { manager, session, label } = await ensureSession(orgId);
    const qr = manager.getQR(orgId, label) ?? null;
    const snapshot = session.getStatusSnapshot();

    return {
      qr,
      connection_state: snapshot.status,
      connected: snapshot.status === "connected",
      session_label: label
    };
  },

  async disconnect(orgId: string): Promise<{ success: boolean; message: string }> {
    const manager = await getSessionManager();
    const label = getSessionLabel();
    const liveSession = await manager.getSession(orgId, label);

    try {
      if (liveSession) {
        await manager.removeSession(orgId, label);
      } else {
        await clearStoredSession(orgId, label);
      }

      return { success: true, message: "WhatsApp session disconnected." };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to disconnect WhatsApp session"
      };
    }
  }
};
