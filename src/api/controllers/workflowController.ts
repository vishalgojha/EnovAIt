import type { Request, Response } from "express";

import { AppError } from "../../lib/errors.js";
import { getRequestContext } from "../../lib/requestContext.js";
import { WorkflowIdParamSchema, WorkflowTransitionSchema } from "../schemas/workflowSchemas.js";

export const workflowController = {
  async getInstance(req: Request, res: Response) {
    const { id } = WorkflowIdParamSchema.parse(req.params);
    const { auth, supabase } = getRequestContext(req);

    const { data, error } = await supabase
      .from("workflow_instances")
      .select("*")
      .eq("id", id)
      .eq("org_id", auth.orgId)
      .single();

    if (error || !data) {
      throw new AppError("Workflow instance not found", 404, "WORKFLOW_NOT_FOUND", error);
    }

    res.status(200).json({ data });
  },

  async transition(req: Request, res: Response) {
    const { id } = WorkflowIdParamSchema.parse(req.params);
    const payload = WorkflowTransitionSchema.parse(req.body);
    const { auth, supabase } = getRequestContext(req);

    const { data: existing, error: readError } = await supabase
      .from("workflow_instances")
      .select("history, current_step")
      .eq("id", id)
      .eq("org_id", auth.orgId)
      .single();

    if (readError || !existing) {
      throw new AppError("Workflow instance not found", 404, "WORKFLOW_NOT_FOUND", readError);
    }

    const history = Array.isArray(existing.history) ? existing.history : [];
    history.push({
      at: new Date().toISOString(),
      by: auth.userId,
      transition: payload.state,
      comment: payload.comment ?? null
    });

    const { data, error } = await supabase
      .from("workflow_instances")
      .update({
        state: payload.state,
        current_step: payload.state,
        history,
        last_transition_at: new Date().toISOString(),
        updated_by: auth.userId
      })
      .eq("id", id)
      .eq("org_id", auth.orgId)
      .select("id, state, current_step, last_transition_at")
      .single();

    if (error || !data) {
      throw new AppError("Failed to transition workflow", 500, "DB_WRITE_FAILED", error);
    }

    res.status(200).json({ data });
  }
};
