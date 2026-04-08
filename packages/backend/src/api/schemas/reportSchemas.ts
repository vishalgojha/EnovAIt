import { z } from "zod";

export const GenerateReportRequestSchema = z.object({
  report_type: z.enum(["esg_summary", "brsr_annual_report", "operations_dashboard", "compliance_checklist", "custom"]),
  module_id: z.string().uuid().optional(),
  title: z.string().min(3).max(200).optional(),
  filters: z.record(z.string(), z.unknown()).default({})
});

export const ReportIdParamSchema = z.object({
  id: z.string().uuid()
});

export const ListReportsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  report_type: z.enum(["esg_summary", "brsr_annual_report", "operations_dashboard", "compliance_checklist", "custom"]).optional()
});

export type GenerateReportRequest = z.infer<typeof GenerateReportRequestSchema>;
