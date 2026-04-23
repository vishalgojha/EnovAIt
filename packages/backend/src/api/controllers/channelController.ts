import type { Request, Response } from "express";

import { env } from "../../config.js";
import { AppError } from "../../lib/errors.js";
import { getRequestContext } from "../../lib/requestContext.js";
import { channelRegistry } from "../../services/channels/channelRegistry.js";
import { whatsappBaileysService } from "../../services/channels/whatsappBaileysService.js";
import { whatsappEvolutionService } from "../../services/channels/whatsappEvolutionService.js";
import { whatsappIngestionService } from "../../services/channels/whatsappIngestionService.js";
import { whatsappOfficialService } from "../../services/channels/whatsappOfficialService.js";
import type { ChannelSendResult } from "../../services/channels/types.js";
import {
  ChannelSendRequestSchema,
  ChannelStatusParamSchema,
  ChannelWebhookParamSchema,
  OfficialWebhookVerifyQuerySchema,
  WhatsAppSendRequestSchema,
  WhatsAppWebhookPathSchema
} from "../schemas/channelSchemas.js";

export const channelController = {
  async sendMessage(req: Request, res: Response) {
    const payload = ChannelSendRequestSchema.parse(req.body);
    const { auth } = getRequestContext(req);

    let result: ChannelSendResult;
    if (payload.channel === "whatsapp_evolution") {
      if (!payload.to) {
        throw new AppError("Recipient phone is required for whatsapp_evolution", 400, "TO_REQUIRED");
      }
      const evolutionResult = await whatsappEvolutionService.sendText({
        orgId: auth.orgId,
        to: payload.to,
        message: payload.message
      });
      result = {
        channel: "whatsapp_evolution",
        accepted: true,
        external_id: evolutionResult.message_id,
        detail: `Sent via Evolution API instance ${evolutionResult.instance}`
      };
    } else if (payload.channel === "whatsapp_official") {
      if (!payload.to) {
        throw new AppError("Recipient phone is required for whatsapp_official", 400, "TO_REQUIRED");
      }
      const officialResult = await channelRegistry.send(payload.channel, {
        to: payload.to,
        subject: payload.subject,
        message: payload.message,
        metadata: payload.metadata,
        orgId: auth.orgId
      });
      result = officialResult;
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
    const status =
      channel === "whatsapp_evolution"
        ? await whatsappEvolutionService.getStatus({ orgId: auth.orgId })
        : channel === "whatsapp_official"
          ? await channelRegistry.status(channel, { orgId: auth.orgId })
          : await channelRegistry.status(channel, { orgId: auth.orgId });
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

  async getBaileysQr(_req: Request, res: Response) {
    const qrData = await whatsappBaileysService.getQrCode();
    res.status(200).json({ data: qrData });
  },

  async disconnectBaileys(_req: Request, res: Response) {
    const result = await whatsappBaileysService.disconnect();
    res.status(200).json({ data: result });
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

  async receiveOfficialWebhook(req: Request, res: Response) {
    const { integrationId } = WhatsAppWebhookPathSchema.parse(req.params);
    const result = await whatsappIngestionService.ingestWebhook(req.body, integrationId, "official");
    res.status(200).json({ received: true, ...result });
  },

  async receiveEvolutionWebhook(req: Request, res: Response) {
    const { integrationId } = WhatsAppWebhookPathSchema.parse(req.params);
    const result = await whatsappEvolutionService.ingestWebhook(req.body, integrationId);
    res.status(200).json({ received: true, ...result });
  }
};
