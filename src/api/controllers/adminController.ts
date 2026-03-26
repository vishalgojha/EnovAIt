import type { Request, Response } from "express";

import { AppError } from "../../lib/errors.js";
import { getRequestContext } from "../../lib/requestContext.js";
import {
  ResourceIdParamSchema,
  UpsertModuleSchema,
  UpsertTemplateSchema,
  UpsertWorkflowRuleSchema
} from "../schemas/adminSchemas.js";

export const adminController = {
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
