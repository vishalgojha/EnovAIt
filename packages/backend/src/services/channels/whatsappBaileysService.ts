import pino from "pino";

import { env } from "../../config.js";
import { AppError } from "../../lib/errors.js";

type BaileysSocketLike = {
  user?: { id?: string };
  sendMessage: (jid: string, content: { text: string }) => Promise<unknown>;
  ev: {
    on: (event: string, handler: (payload: unknown) => void | Promise<void>) => void;
  };
};

let socketPromise: Promise<BaileysSocketLike> | null = null;
let lastConnectionState = "disconnected";
let isBaileysAvailable = true;

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

const getOrCreateSocket = async (): Promise<BaileysSocketLike> => {
  if (!isBaileysAvailable) {
    throw new AppError(
      "WhatsApp Baileys is not installed in this deployment. Use whatsapp_official channel or install @whiskeysockets/baileys.",
      503,
      "WHATSAPP_BAILEYS_NOT_INSTALLED"
    );
  }

  if (socketPromise) {
    return socketPromise;
  }

  socketPromise = (async () => {
    try {
      const moduleName = "@whiskeysockets/baileys";
      const baileysModule = await import(moduleName);
      const makeWASocket = baileysModule.default as unknown as (params: {
        auth: unknown;
        printQRInTerminal: boolean;
        logger: unknown;
      }) => BaileysSocketLike;
      const useMultiFileAuthState = baileysModule.useMultiFileAuthState as unknown as (
        folder: string
      ) => Promise<{ state: unknown; saveCreds: () => Promise<void> }>;

      const { state, saveCreds } = await useMultiFileAuthState(env.WHATSAPP_BAILEYS_SESSION_PATH);

      const socket = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: "silent" })
      });

      socket.ev.on("creds.update", async () => {
        await saveCreds();
      });

      socket.ev.on("connection.update", (update: unknown) => {
        const payload = update as { connection?: string };
        lastConnectionState = payload.connection ?? lastConnectionState;
      });

      return socket;
    } catch (error) {
      socketPromise = null;
      if (error instanceof Error && /Cannot find package '@whiskeysockets\/baileys'/.test(error.message)) {
        isBaileysAvailable = false;
        throw new AppError(
          "WhatsApp Baileys is not installed in this deployment. Use whatsapp_official channel or install @whiskeysockets/baileys.",
          503,
          "WHATSAPP_BAILEYS_NOT_INSTALLED",
          error
        );
      }
      throw new AppError(
        "Failed to initialize WhatsApp Baileys client. Ensure @whiskeysockets/baileys is installed and QR login is completed.",
        500,
        "WHATSAPP_BAILEYS_INIT_FAILED",
        error
      );
    }
  })();

  return socketPromise;
};

export const whatsappBaileysService = {
  async sendText(to: string, message: string): Promise<{ provider: "baileys"; jid: string }> {
    const socket = await getOrCreateSocket();
    const jid = normalizeJid(to);

    await socket.sendMessage(jid, { text: message });

    return {
      provider: "baileys",
      jid
    };
  },

  async getStatus(): Promise<{ provider: "baileys"; connected: boolean; connection_state: string; user_id: string | null }> {
    if (!isBaileysAvailable) {
      return {
        provider: "baileys",
        connected: false,
        connection_state: "not_installed",
        user_id: null
      };
    }

    const socket = await getOrCreateSocket();

    return {
      provider: "baileys",
      connected: lastConnectionState === "open",
      connection_state: lastConnectionState,
      user_id: socket.user?.id ?? null
    };
  }
};
