import { z } from "zod";

export const WorkflowTransitionSchema = z.object({
  state: z.enum(["pending", "approved", "rejected", "escalated", "completed"]),
  comment: z.string().max(1000).optional()
});

export const WorkflowIdParamSchema = z.object({
  id: z.string().uuid()
});

export const ListWorkflowsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  state: z.enum(["pending", "approved", "rejected", "escalated", "completed"]).optional()
});
