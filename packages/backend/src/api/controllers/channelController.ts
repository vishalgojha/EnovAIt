import type { Request, Response } from "express";

import { env } from "../../config.js";
import { AppError } from "../../lib/errors.js";
import { getRequestContext } from "../../lib/requestContext.js";
import { channelRegistry } from "../../services/channels/channelRegistry.js";
import { whatsappBaileysService } from "../../services/channels/whatsappBaileysService.js";
import type { ChannelSendResult } from "../../services/channels/types.js";
import {
  ChannelSendRequestSchema,
  ChannelStatusParamSchema,
  ChannelWebhookParamSchema,
  WhatsAppSendRequestSchema,
} from "../schemas/channelSchemas.js";

export const channelController = {
  async sendMessage(req: Request, res: Response) {
    const payload = ChannelSendRequestSchema.parse(req.body);
    const { auth } = getRequestContext(req);

    let result: ChannelSendResult;

    if (payload.channel === "whatsapp_baileys") {
      if (!payload.to) {
        throw new AppError("Recipient phone is required for whatsapp_baileys", 400, "TO_REQUIRED");
      }
      const baileysResult = await whatsappBaileysService.sendText({
        orgId: auth.orgId,
        to: payload.to,
        message: payload.message
      });
      result = {
        channel: "whatsapp_baileys",
        accepted: true,
        external_id: baileysResult.jid,
        detail: "Sent via WhatsApp Baileys"
      };
    } else {
      result = await channelRegistry.send(payload.channel, {
        to: payload.to,
        subject: payload.subject,
        message: payload.message,
        metadata: payload.metadata,
        orgId: auth.orgId
      });
    }

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
    const { auth } = getRequestContext(req);
    const status = await channelRegistry.status(channel, { orgId: auth.orgId });
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

    res.status(200).json(result);
  },

  async sendWhatsAppMessage(req: Request, res: Response) {
    const payload = WhatsAppSendRequestSchema.parse(req.body);
    const { auth } = getRequestContext(req);

    const result = await channelRegistry.send("whatsapp_baileys", {
      to: payload.to,
      message: payload.message,
      metadata: {},
      orgId: auth.orgId
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

  async getBaileysStatus(req: Request, res: Response) {
    const { auth } = getRequestContext(req);
    const status = await whatsappBaileysService.getStatus(auth.orgId);
    res.status(200).json({ data: status });
  },

  async getBaileysQr(req: Request, res: Response) {
    const { auth } = getRequestContext(req);
    const qrData = await whatsappBaileysService.getQrCode(auth.orgId);
    res.status(200).json({ data: qrData });
  },

  async disconnectBaileys(req: Request, res: Response) {
    const { auth } = getRequestContext(req);
    const result = await whatsappBaileysService.disconnect(auth.orgId);
    res.status(200).json({ data: result });
  }
};
