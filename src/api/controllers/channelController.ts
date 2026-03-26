import type { Request, Response } from "express";

import { getRequestContext } from "../../lib/requestContext.js";
import { OfficialWebhookVerifyQuerySchema, WhatsAppSendRequestSchema } from "../schemas/channelSchemas.js";
import { whatsappBaileysService } from "../../services/channels/whatsappBaileysService.js";
import { whatsappOfficialService } from "../../services/channels/whatsappOfficialService.js";

export const channelController = {
  async sendWhatsAppMessage(req: Request, res: Response) {
    const payload = WhatsAppSendRequestSchema.parse(req.body);
    const { auth } = getRequestContext(req);

    const sendResult =
      payload.provider === "official"
        ? await whatsappOfficialService.sendText(payload.to, payload.message)
        : await whatsappBaileysService.sendText(payload.to, payload.message);

    res.status(200).json({
      data: {
        ...sendResult,
        sent_by: auth.userId,
        sent_at: new Date().toISOString()
      }
    });
  },

  async getBaileysStatus(_req: Request, res: Response) {
    const status = await whatsappBaileysService.getStatus();
    res.status(200).json({ data: status });
  },

  verifyOfficialWebhook(req: Request, res: Response) {
    const query = OfficialWebhookVerifyQuerySchema.parse(req.query);
    const challenge = whatsappOfficialService.verifyWebhook(
      query["hub.mode"],
      query["hub.verify_token"],
      query["hub.challenge"]
    );

    res.status(200).send(challenge);
  },

  receiveOfficialWebhook(req: Request, res: Response) {
    const summary = whatsappOfficialService.summarizeWebhookPayload(req.body);
    res.status(200).json({ received: true, ...summary });
  }
};
