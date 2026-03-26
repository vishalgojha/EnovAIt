import { z } from "zod";

export const WorkflowTransitionSchema = z.object({
  state: z.enum(["pending", "approved", "rejected", "escalated", "completed"]),
  comment: z.string().max(1000).optional()
});

export const WorkflowIdParamSchema = z.object({
  id: z.string().uuid()
});
