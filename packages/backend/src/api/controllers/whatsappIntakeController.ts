import type { Request, Response } from "express";

import { AppError } from "../../lib/errors.js";
import { getRequestContext } from "../../lib/requestContext.js";
import { whatsappIntakeService } from "../../services/intake/whatsappIntakeService.js";

export const whatsappIntakeController = {
  async receiveMessage(req: Request, res: Response) {
    const { auth, supabase } = getRequestContext(req);
    const { from, message } = req.body;

    if (!from || !message) {
      throw new AppError("from and message are required", 400, "MISSING_FIELDS");
    }

    const result = await whatsappIntakeService.processTextMessage(
      supabase,
      auth,
      from,
      message
    );

    res.status(202).json({
      data: {
        accepted: true,
        recordId: result.recordId,
        classification: result.classification,
      },
    });
  },

  async receiveEvidence(req: Request, res: Response) {
    const { auth, supabase } = getRequestContext(req);
    const { from, message, module_id } = req.body;

    if (!from || !message) {
      throw new AppError("from and message are required", 400, "MISSING_FIELDS");
    }

    const result = await whatsappIntakeService.processEvidence(
      supabase,
      auth,
      from,
      message,
      module_id
    );

    res.status(202).json({
      data: {
        accepted: true,
        recordId: result.recordId,
        title: result.title,
        classification: result.classification,
      },
    });
  }
};
