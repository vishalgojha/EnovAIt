import type { Request, Response } from "express";

import { env } from "../../config.js";
import { AppError } from "../../lib/errors.js";
import { logger } from "../../lib/logger.js";
import { emailIntakeService } from "../../services/intake/emailIntakeService.js";

export const emailIntakeController = {
  async receiveEmail(req: Request, res: Response) {
    const webhookToken = env.CHANNEL_WEBHOOK_TOKEN;
    const providedToken = req.headers["x-webhook-token"] as string | undefined;

    if (webhookToken && providedToken !== webhookToken) {
      throw new AppError("Invalid webhook token", 401, "UNAUTHORIZED");
    }

    const payload = req.body;

    logger.info({ source: "email_webhook", hasAttachments: !!payload.attachments }, "Received email webhook");

    const result = await emailIntakeService.processIncomingEmail(payload);

    res.status(202).json({
      data: {
        accepted: result.accepted,
        recordsCreated: result.recordsCreated,
        ingestionEventIds: result.ingestionEventIds,
      },
    });
  },

  async forwardEvidence(req: Request, res: Response) {
    const { org_id, module_id, email_data } = req.body;

    if (!org_id || !module_id || !email_data) {
      throw new AppError("org_id, module_id, and email_data are required", 400, "MISSING_FIELDS");
    }

    const result = await emailIntakeService.forwardEvidenceToModule(org_id, module_id, email_data);

    res.status(202).json({
      data: {
        accepted: true,
        recordId: result.recordId,
        title: result.title,
      },
    });
  }
};
