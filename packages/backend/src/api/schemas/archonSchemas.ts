import { z } from "zod";

export const RunArchonTaskSchema = z.object({
  goal: z.string().min(5).max(5000),
  language: z.string().min(2).max(50).optional(),
  context: z.record(z.string(), z.unknown()).default({}),
});
