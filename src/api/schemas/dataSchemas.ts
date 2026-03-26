import { z } from "zod";

export const ListDataRecordsQuerySchema = z.object({
  module_id: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0)
});

export const DataRecordIdParamSchema = z.object({
  id: z.string().uuid()
});

export const ExcelIngestBodySchema = z.object({
  module_id: z.string().uuid()
});
