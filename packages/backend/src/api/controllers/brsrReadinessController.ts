import type { Request, Response } from "express";

import { getRequestContext } from "../../lib/requestContext.js";
import { brsrReadinessService } from "../../services/readiness/brsrReadinessService.js";

export const brsrReadinessController = {
  async getReadiness(req: Request, res: Response) {
    const { auth, supabase } = getRequestContext(req);

    const readiness = await brsrReadinessService.computeReadiness(supabase, auth.orgId);

    res.status(200).json({ data: readiness });
  },

  async getSectionDetail(req: Request, res: Response) {
    const { auth, supabase } = getRequestContext(req);

    const sections = await brsrReadinessService.computeSectionDetail(supabase, auth.orgId);

    res.status(200).json({ data: sections });
  },

  async getPrincipleDetail(req: Request, res: Response) {
    const { auth, supabase } = getRequestContext(req);

    const principles = await brsrReadinessService.computePrincipleDetail(supabase, auth.orgId);

    res.status(200).json({ data: principles });
  },

  async getGaps(req: Request, res: Response) {
    const { auth, supabase } = getRequestContext(req);

    const gaps = await brsrReadinessService.computeGaps(supabase, auth.orgId);

    res.status(200).json({ data: gaps });
  }
};
