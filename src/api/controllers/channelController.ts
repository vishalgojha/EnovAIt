import type { Request, Response } from "express";

import { env } from "../../config.js";
import { AppError } from "../../lib/errors.js";
import { getRequestContext } from "../../lib/requestContext.js";
import { channelRegistry } from "../../services/channels/channelRegistry.js";
import { whatsappBaileysService } from "../../services/channels/whatsappBaileysService.js";
import { whatsappOfficialService } from "../../services/channels/whatsappOfficialService.js";
import {
  ChannelSendRequestSchema,
  ChannelStatusParamSchema,
  ChannelWebhookParamSchema,
  OfficialWebhookVerifyQuerySchema,
  WhatsAppSendRequestSchema
} from "../schemas/channelSchemas.js";

export const channelController = {
  async sendMessage(req: Request, res: Response) {
    const payload = ChannelSendRequestSchema.parse(req.body);
    const { auth } = getRequestContext(req);

    const result = await channelRegistry.send(payload.channel, {
      to: payload.to,
      subject: payload.subject,
      message: payload.message,
      metadata: payload.metadata
    });

    res.status(200).json({
      data: {
        ...result,
        sent_by: auth.userId,
        sent_at: new Date().toISOString()
      }
    });
  },

  async getStatus(req: Request, res: Response) {
    const { channel } = ChannelStatusParamSchema.parse(req.params);
    const status = await channelRegistry.status(channel);
    res.status(200).json({ data: status });
  },

  async ingestWebhook(req: Request, res: Response) {
    const { channel } = ChannelWebhookParamSchema.parse(req.params);

    if (env.CHANNEL_WEBHOOK_TOKEN) {
      const token = req.header("x-channel-webhook-token");
      if (token !== env.CHANNEL_WEBHOOK_TOKEN) {
        throw new AppError("Invalid channel webhook token", 401, "UNAUTHORIZED_WEBHOOK");
      }
    }

    const result = await channelRegistry.ingest(channel, req.body);

    if (channel === "slack" && typeof result.summary.challenge === "string") {
      res.status(200).send(result.summary.challenge);
      return;
    }

    res.status(200).json(result);
  },

  async sendWhatsAppMessage(req: Request, res: Response) {
    const payload = WhatsAppSendRequestSchema.parse(req.body);
    const { auth } = getRequestContext(req);

    const channel = payload.provider === "official" ? "whatsapp_official" : "whatsapp_baileys";
    const result = await channelRegistry.send(channel, {
      to: payload.to,
      message: payload.message,
      metadata: {}
    });

    res.status(200).json({
      data: {
        provider: payload.provider,
        ...result,
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
