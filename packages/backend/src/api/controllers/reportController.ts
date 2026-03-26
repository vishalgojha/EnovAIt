import type { Request, Response } from "express";

import { AppError } from "../../lib/errors.js";
import { getRequestContext } from "../../lib/requestContext.js";
import { reportService } from "../../services/reporting/reportService.js";
import { GenerateReportRequestSchema, ReportIdParamSchema } from "../schemas/reportSchemas.js";

export const reportController = {
  async generate(req: Request, res: Response) {
    const payload = GenerateReportRequestSchema.parse(req.body);
    const { auth, supabase } = getRequestContext(req);

    const report = await reportService.generate(supabase, auth, payload);
    res.status(201).json({ data: report });
  },

  async getById(req: Request, res: Response) {
    const { id } = ReportIdParamSchema.parse(req.params);
    const { auth, supabase } = getRequestContext(req);

    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("id", id)
      .eq("org_id", auth.orgId)
      .single();

    if (error || !data) {
      throw new AppError("Report not found", 404, "REPORT_NOT_FOUND", error);
    }

    res.status(200).json({ data });
  }
};
