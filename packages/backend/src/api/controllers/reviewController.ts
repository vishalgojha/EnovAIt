import type { Request, Response } from "express";

import { getRequestContext } from "../../lib/requestContext.js";
import { reviewService } from "../../services/review/reviewService.js";
import { DataRecordIdParamSchema } from "../schemas/dataSchemas.js";

export const reviewController = {
  async getReviewQueue(req: Request, res: Response) {
    const { auth, supabase } = getRequestContext(req);

    const queue = await reviewService.getReviewQueue(supabase, auth.orgId);

    res.status(200).json({ data: queue });
  },

  async getReviewDetail(req: Request, res: Response) {
    const { id } = DataRecordIdParamSchema.parse(req.params);
    const { auth, supabase } = getRequestContext(req);

    const detail = await reviewService.getReviewDetail(supabase, auth.orgId, id);

    res.status(200).json({ data: detail });
  },

  async approve(req: Request, res: Response) {
    const { id } = DataRecordIdParamSchema.parse(req.params);
    const { auth, supabase } = getRequestContext(req);
    const comment = typeof req.body.comment === "string" ? req.body.comment : "";

    const result = await reviewService.approve(supabase, auth.orgId, id, auth.userId, comment);

    res.status(200).json({ data: result });
  },

  async reject(req: Request, res: Response) {
    const { id } = DataRecordIdParamSchema.parse(req.params);
    const { auth, supabase } = getRequestContext(req);
    const comment = typeof req.body.comment === "string" ? req.body.comment : "Rejected";

    const result = await reviewService.reject(supabase, auth.orgId, id, auth.userId, comment);

    res.status(200).json({ data: result });
  },

  async escalate(req: Request, res: Response) {
    const { id } = DataRecordIdParamSchema.parse(req.params);
    const { auth, supabase } = getRequestContext(req);
    const comment = typeof req.body.comment === "string" ? req.body.comment : "Escalated for review";

    const result = await reviewService.escalate(supabase, auth.orgId, id, auth.userId, comment);

    res.status(200).json({ data: result });
  }
};
