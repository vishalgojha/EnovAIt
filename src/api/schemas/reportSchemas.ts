import { z } from "zod";

export const GenerateReportRequestSchema = z.object({
  report_type: z.enum(["esg_summary", "operations_dashboard", "compliance_checklist", "custom"]),
  module_id: z.string().uuid().optional(),
  title: z.string().min(3).max(200).optional(),
  filters: z.record(z.string(), z.unknown()).default({})
});

export const ReportIdParamSchema = z.object({
  id: z.string().uuid()
});

export type GenerateReportRequest = z.infer<typeof GenerateReportRequestSchema>;
