import type { Request, Response } from "express";

import { AppError } from "../../lib/errors.js";
import { getRequestContext } from "../../lib/requestContext.js";
import { logger } from "../../lib/logger.js";
import { readSecretsEnvironmentStatus, SecretsEnvironmentSchema, writeSecretsEnvironment } from "../../lib/secretsEnvironment.js";
import {
  ResourceIdParamSchema,
  UpsertIntegrationSchema,
  UpsertModuleSchema,
  UpsertTemplateSchema,
  UpsertWorkflowRuleSchema
} from "../schemas/adminSchemas.js";

export const adminController = {
  async getPlatformSummary(req: Request, res: Response) {
    const { auth, supabase } = getRequestContext(req);

    const [integrationsResult, pendingWorkflowsResult, notificationsResult] = await Promise.all([
      supabase.from("integrations").select("id", { count: "exact", head: true }).eq("org_id", auth.orgId).eq("is_active", true),
      supabase
        .from("workflow_instances")
        .select("id", { count: "exact", head: true })
        .eq("org_id", auth.orgId)
        .in("state", ["pending", "escalated"]),
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("org_id", auth.orgId)
        .eq("status", "failed")
    ]);

    for (const result of [integrationsResult, pendingWorkflowsResult, notificationsResult]) {
      if (result.error) {
        throw new AppError("Failed to load platform summary", 500, "DB_READ_FAILED", result.error);
      }
    }

    res.status(200).json({
      data: {
        activeIntegrations: integrationsResult.count ?? 0,
        pendingApprovals: pendingWorkflowsResult.count ?? 0,
        failedNotifications: notificationsResult.count ?? 0
      }
    });
  },

  async listPlatformLogs(req: Request, res: Response) {
    const { auth, supabase } = getRequestContext(req);
    const limit = Math.min(Number(req.query.limit ?? 20), 100);

    const [workflowEventsResult, notificationsResult] = await Promise.all([
      supabase
        .from("workflow_events")
        .select("id, event_type, payload, processed_at, created_at")
        .eq("org_id", auth.orgId)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase
        .from("notifications")
        .select("id, channel, status, title, body, sent_at, created_at")
        .eq("org_id", auth.orgId)
        .order("created_at", { ascending: false })
        .limit(limit)
    ]);

    for (const result of [workflowEventsResult, notificationsResult]) {
      if (result.error) {
        throw new AppError("Failed to load platform logs", 500, "DB_READ_FAILED", result.error);
      }
    }

    const logs = [
      ...(workflowEventsResult.data ?? []).map((entry) => ({
        id: entry.id,
        source: "Workflow event",
        kind: "workflow_event",
        title: entry.event_type,
        detail: JSON.stringify(entry.payload).slice(0, 180),
        status: entry.processed_at ? "processed" : "pending",
        at: entry.created_at
      })),
      ...(notificationsResult.data ?? []).map((entry) => ({
        id: entry.id,
        source: "Notification",
        kind: "notification",
        title: `${entry.channel} · ${entry.status}`,
        detail: `${entry.title}${entry.body ? ` - ${entry.body}` : ""}`,
        status: entry.sent_at ? "sent" : entry.status,
        at: entry.created_at
      }))
    ]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, limit);

    res.status(200).json({ data: logs });
  },

  async listPlatformApprovals(req: Request, res: Response) {
    const { auth, supabase } = getRequestContext(req);
    const limit = Math.min(Number(req.query.limit ?? 20), 100);

    const { data, error } = await supabase
      .from("workflow_instances")
      .select("id, state, current_step, payload, history, created_at, last_transition_at, assigned_to, data_record_id, rule_id")
      .eq("org_id", auth.orgId)
      .in("state", ["pending", "escalated", "rejected"])
      .order("last_transition_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new AppError("Failed to load approvals", 500, "DB_READ_FAILED", error);
    }

    const approvals = (data ?? []).map((item) => {
      const payload = (item.payload ?? {}) as Record<string, unknown>;
      const title =
        typeof payload.title === "string"
          ? payload.title
          : typeof payload.record_type === "string"
            ? payload.record_type
            : item.current_step || "Review item";

      const history = Array.isArray(item.history) ? item.history : [];
      const latest = history.length > 0 ? history[history.length - 1] : null;

      return {
        id: item.id,
        state: item.state,
        title,
        summary: latest && typeof latest === "object" && latest !== null && "comment" in latest
          ? String((latest as { comment?: unknown }).comment ?? "")
          : `Rule ${item.rule_id ?? "n/a"} requires review`,
        assignedTo: item.assigned_to,
        dataRecordId: item.data_record_id,
        updatedAt: item.last_transition_at
      };
    });

    res.status(200).json({ data: approvals });
  },

  async listModules(req: Request, res: Response) {
    const { auth, supabase } = getRequestContext(req);

    const { data, error } = await supabase
      .from("modules")
      .select("*")
      .eq("org_id", auth.orgId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError("Failed to list modules", 500, "DB_READ_FAILED", error);
    }

    res.status(200).json({ data: data ?? [] });
  },

  async createModule(req: Request, res: Response) {
    const payload = UpsertModuleSchema.parse(req.body);
    const { auth, supabase } = getRequestContext(req);

    const { data, error } = await supabase
      .from("modules")
      .insert({
        org_id: auth.orgId,
        ...payload,
        created_by: auth.userId,
        updated_by: auth.userId
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new AppError("Failed to create module", 500, "DB_WRITE_FAILED", error);
    }

    res.status(201).json({ data });
  },

  async updateModule(req: Request, res: Response) {
    const { id } = ResourceIdParamSchema.parse(req.params);
    const payload = UpsertModuleSchema.partial().parse(req.body);
    const { auth, supabase } = getRequestContext(req);

    const { data, error } = await supabase
      .from("modules")
      .update({ ...payload, updated_by: auth.userId })
      .eq("id", id)
      .eq("org_id", auth.orgId)
      .select("*")
      .single();

    if (error || !data) {
      throw new AppError("Failed to update module", 500, "DB_WRITE_FAILED", error);
    }

    res.status(200).json({ data });
  },

  async listTemplates(req: Request, res: Response) {
    const { auth, supabase } = getRequestContext(req);

    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .eq("org_id", auth.orgId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError("Failed to list templates", 500, "DB_READ_FAILED", error);
    }

    res.status(200).json({ data: data ?? [] });
  },

  async createTemplate(req: Request, res: Response) {
    const payload = UpsertTemplateSchema.parse(req.body);
    const { auth, supabase } = getRequestContext(req);

    const { data, error } = await supabase
      .from("templates")
      .insert({
        org_id: auth.orgId,
        ...payload,
        created_by: auth.userId,
        updated_by: auth.userId
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new AppError("Failed to create template", 500, "DB_WRITE_FAILED", error);
    }

    res.status(201).json({ data });
  },

  async updateTemplate(req: Request, res: Response) {
    const { id } = ResourceIdParamSchema.parse(req.params);
    const payload = UpsertTemplateSchema.partial().parse(req.body);
    const { auth, supabase } = getRequestContext(req);

    const { data, error } = await supabase
      .from("templates")
      .update({ ...payload, updated_by: auth.userId })
      .eq("id", id)
      .eq("org_id", auth.orgId)
      .select("*")
      .single();

    if (error || !data) {
      throw new AppError("Failed to update template", 500, "DB_WRITE_FAILED", error);
    }

    res.status(200).json({ data });
  },

  async listWorkflowRules(req: Request, res: Response) {
    const { auth, supabase } = getRequestContext(req);

    const { data, error } = await supabase
      .from("workflow_rules")
      .select("*")
      .eq("org_id", auth.orgId)
      .order("priority", { ascending: true });

    if (error) {
      throw new AppError("Failed to list workflow rules", 500, "DB_READ_FAILED", error);
    }

    res.status(200).json({ data: data ?? [] });
  },

  async createWorkflowRule(req: Request, res: Response) {
    const payload = UpsertWorkflowRuleSchema.parse(req.body);
    const { auth, supabase } = getRequestContext(req);

    const { data, error } = await supabase
      .from("workflow_rules")
      .insert({
        org_id: auth.orgId,
        ...payload,
        created_by: auth.userId,
        updated_by: auth.userId
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new AppError("Failed to create workflow rule", 500, "DB_WRITE_FAILED", error);
    }

    res.status(201).json({ data });
  },

  async updateWorkflowRule(req: Request, res: Response) {
    const { id } = ResourceIdParamSchema.parse(req.params);
    const payload = UpsertWorkflowRuleSchema.partial().parse(req.body);
    const { auth, supabase } = getRequestContext(req);

    const { data, error } = await supabase
      .from("workflow_rules")
      .update({ ...payload, updated_by: auth.userId })
      .eq("id", id)
      .eq("org_id", auth.orgId)
      .select("*")
      .single();

    if (error || !data) {
      throw new AppError("Failed to update workflow rule", 500, "DB_WRITE_FAILED", error);
    }

    res.status(200).json({ data });
  },

  async listIntegrations(req: Request, res: Response) {
    const { auth, supabase } = getRequestContext(req);

    const { data, error } = await supabase
      .from("integrations")
      .select("*")
      .eq("org_id", auth.orgId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError("Failed to list integrations", 500, "DB_READ_FAILED", error);
    }

    res.status(200).json({ data: data ?? [] });
  },

  async createIntegration(req: Request, res: Response) {
    const payload = UpsertIntegrationSchema.parse(req.body);
    const { auth, supabase } = getRequestContext(req);

    const { data, error } = await supabase
      .from("integrations")
      .insert({
        org_id: auth.orgId,
        ...payload,
        module_id: payload.module_id ?? null,
        secret_ref: payload.secret_ref ?? null,
        created_by: auth.userId,
        updated_by: auth.userId
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new AppError("Failed to create integration", 500, "DB_WRITE_FAILED", error);
    }

    res.status(201).json({ data });
  },

  async updateIntegration(req: Request, res: Response) {
    const { id } = ResourceIdParamSchema.parse(req.params);
    const payload = UpsertIntegrationSchema.partial().parse(req.body);
    const { auth, supabase } = getRequestContext(req);

    const updateData: Record<string, unknown> = {
      ...payload,
      updated_by: auth.userId
    };

    if (payload.module_id === undefined) {
      delete updateData.module_id;
    }

    if (payload.secret_ref === undefined) {
      delete updateData.secret_ref;
    }

    const { data, error } = await supabase
      .from("integrations")
      .update(updateData)
      .eq("id", id)
      .eq("org_id", auth.orgId)
      .select("*")
      .single();

    if (error || !data) {
      throw new AppError("Failed to update integration", 500, "DB_WRITE_FAILED", error);
    }

    res.status(200).json({ data });
  },

  async getOrgSettings(req: Request, res: Response) {
    const { auth, supabase } = getRequestContext(req);

    const { data, error } = await supabase
      .from("organizations")
      .select("id, name, slug, settings, is_active, updated_at")
      .eq("id", auth.orgId)
      .single();

    if (error || !data) {
      throw new AppError("Failed to fetch organization settings", 500, "DB_READ_FAILED", error);
    }

    res.status(200).json({ data });
  },

  async getPlatformSecrets(_req: Request, res: Response) {
    const status = await readSecretsEnvironmentStatus();

    res.status(200).json({
      data: status
    });
  },

  async updatePlatformSecrets(req: Request, res: Response) {
    const payload = SecretsEnvironmentSchema.parse(req.body);
    const { auth } = getRequestContext(req);

    const status = await writeSecretsEnvironment(payload);

    logger.info(
      {
        actor: auth.email,
        aiProvider: status.aiProvider,
        path: status.path
      },
      "Updated EnovAIt secrets environment"
    );

    res.status(200).json({
      data: {
        ...status,
        restartRequired: true,
        message: "Secrets saved. Restart the backend to apply the new values."
      }
    });
  },

  async updateOrgSettings(req: Request, res: Response) {
    const settings = req.body?.settings;
    if (!settings || typeof settings !== "object") {
      throw new AppError("settings object is required", 400, "VALIDATION_ERROR");
    }

    const { auth, supabase } = getRequestContext(req);

    const { data, error } = await supabase
      .from("organizations")
      .update({ settings, updated_by: auth.userId })
      .eq("id", auth.orgId)
      .select("id, name, slug, settings, updated_at")
      .single();

    if (error || !data) {
      throw new AppError("Failed to update organization settings", 500, "DB_WRITE_FAILED", error);
    }

    res.status(200).json({ data });
  }
};
