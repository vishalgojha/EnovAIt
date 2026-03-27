import type { Request, Response } from "express";

import { AppError } from "../../lib/errors.js";
import { getRequestContext } from "../../lib/requestContext.js";
import { reportService } from "../../services/reporting/reportService.js";
import {
  GenerateReportRequestSchema,
  ListReportsQuerySchema,
  ReportIdParamSchema
} from "../schemas/reportSchemas.js";

export const reportController = {
  async list(req: Request, res: Response) {
    const query = ListReportsQuerySchema.parse(req.query);
    const { auth, supabase } = getRequestContext(req);

    const dbQuery = supabase
      .from("reports")
      .select("id, report_type, title, status, generated_at, created_at, updated_at", { count: "exact" })
      .eq("org_id", auth.orgId)
      .order("generated_at", { ascending: false })
      .range(query.offset, query.offset + query.limit - 1);

    if (query.report_type) {
      dbQuery.eq("report_type", query.report_type);
    }

    const { data, error, count } = await dbQuery;
    if (error) {
      throw new AppError("Failed to list reports", 500, "DB_READ_FAILED", error);
    }

    res.status(200).json({
      data: data ?? [],
      pagination: {
        limit: query.limit,
        offset: query.offset,
        total: count ?? 0
      }
    });
  },

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
