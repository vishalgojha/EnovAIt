import type { SupabaseClient } from "@supabase/supabase-js";

import type { GenerateReportRequest } from "../../api/schemas/reportSchemas.js";
import { AppError } from "../../lib/errors.js";
import type { AuthContext } from "../../types/auth.js";

const fetchSnapshot = async (
  supabase: SupabaseClient,
  orgId: string,
  request: GenerateReportRequest
): Promise<unknown> => {
  if (request.report_type === "esg_summary") {
    const query = supabase.from("v_esg_summary").select("*").eq("org_id", orgId);
    if (request.module_id) {
      query.eq("module_id", request.module_id);
    }
    const { data, error } = await query;
    if (error) throw new AppError("Failed to fetch ESG summary", 500, "REPORT_QUERY_FAILED", error);
    return data ?? [];
  }

  if (request.report_type === "operations_dashboard") {
    const query = supabase.from("v_operations_dashboard").select("*").eq("org_id", orgId);
    if (request.module_id) {
      query.eq("module_id", request.module_id);
    }
    const { data, error } = await query;
    if (error) throw new AppError("Failed to fetch operations dashboard", 500, "REPORT_QUERY_FAILED", error);
    return data ?? [];
  }

  const { data, error } = await supabase
    .from("workflow_instances")
    .select("id, state, current_step, created_at, module_id")
    .eq("org_id", orgId)
    .in("state", ["pending", "escalated"])
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new AppError("Failed to fetch compliance checklist", 500, "REPORT_QUERY_FAILED", error);
  }

  return data ?? [];
};

export const reportService = {
  async generate(supabase: SupabaseClient, auth: AuthContext, request: GenerateReportRequest) {
    const snapshot = await fetchSnapshot(supabase, auth.orgId, request);

    const title = request.title ?? `${request.report_type} - ${new Date().toISOString()}`;

    const { data, error } = await supabase
      .from("reports")
      .insert({
        org_id: auth.orgId,
        module_id: request.module_id ?? null,
        report_type: request.report_type,
        title,
        status: "generated",
        version_label: "v1",
        filters: request.filters,
        data_snapshot: snapshot,
        generated_by: auth.userId,
        created_by: auth.userId,
        updated_by: auth.userId
      })
      .select("id, report_type, title, generated_at, status")
      .single();

    if (error || !data) {
      throw new AppError("Failed to save report", 500, "DB_WRITE_FAILED", error);
    }

    return {
      ...data,
      data_snapshot: snapshot,
      export: {
        pdf: "placeholder",
        excel: "placeholder"
      }
    };
  }
};
