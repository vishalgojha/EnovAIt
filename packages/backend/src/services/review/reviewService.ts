import type { SupabaseClient } from "@supabase/supabase-js";

import { AppError } from "../../lib/errors.js";

interface ReviewQueueItem {
  id: string;
  title: string;
  recordType: string;
  status: string;
  sourceChannel: string;
  createdAt: string;
  brsrSection: string | null;
  brsrPrinciples: number[];
  confidence: number;
  needsReview: boolean;
}

interface ReviewDetail {
  id: string;
  title: string;
  recordType: string;
  status: string;
  sourceChannel: string;
  createdAt: string;
  updatedAt: string;
  data: Record<string, unknown>;
  brsrSection: string | null;
  brsrPrinciples: number[];
  confidence: number;
  missingFields: string[];
  evidenceKinds: string[];
  recommendedActions: string[];
  workflowHistory: Array<{
    at: string;
    by: string | null;
    transition: string;
    comment: string | null;
  }>;
}

interface ReviewResult {
  id: string;
  status: string;
  reviewedBy: string;
  reviewedAt: string;
  comment: string | null;
}

export const reviewService = {
  async getReviewQueue(supabase: SupabaseClient, orgId: string): Promise<ReviewQueueItem[]> {
    const { data: records, error } = await supabase
      .from("data_records")
      .select("id, title, record_type, status, source_channel, data, created_at")
      .eq("org_id", orgId)
      .in("status", ["draft", "final"])
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      throw new AppError("Failed to fetch review queue", 500, "DB_READ_FAILED", error);
    }

    return (records ?? []).map((record) => {
      const recordData = (record.data ?? {}) as Record<string, unknown>;
      return {
        id: record.id,
        title: record.title,
        recordType: record.record_type,
        status: record.status,
        sourceChannel: record.source_channel,
        createdAt: record.created_at,
        brsrSection: typeof recordData.brsr_section === "string" ? recordData.brsr_section : null,
        brsrPrinciples: Array.isArray(recordData.brsr_principles)
          ? (recordData.brsr_principles as number[])
          : [],
        confidence: typeof recordData.confidence === "number" ? recordData.confidence : 0,
        needsReview:
          record.status === "draft" ||
          (typeof recordData.confidence === "number" && recordData.confidence < 0.7),
      };
    });
  },

  async getReviewDetail(
    supabase: SupabaseClient,
    orgId: string,
    recordId: string
  ): Promise<ReviewDetail> {
    const { data: record, error } = await supabase
      .from("data_records")
      .select("*")
      .eq("id", recordId)
      .eq("org_id", orgId)
      .single();

    if (error || !record) {
      throw new AppError("Record not found", 404, "RECORD_NOT_FOUND", error);
    }

    const recordData = (record.data ?? {}) as Record<string, unknown>;

    // Fetch workflow history
    const { data: workflowInstances } = await supabase
      .from("workflow_instances")
      .select("history")
      .eq("data_record_id", recordId)
      .eq("org_id", orgId);

    const workflowHistory: ReviewDetail["workflowHistory"] = [];
    for (const instance of workflowInstances ?? []) {
      if (Array.isArray(instance.history)) {
        workflowHistory.push(...instance.history);
      }
    }

    return {
      id: record.id,
      title: record.title,
      recordType: record.record_type,
      status: record.status,
      sourceChannel: record.source_channel,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      data: recordData,
      brsrSection: typeof recordData.brsr_section === "string" ? recordData.brsr_section : null,
      brsrPrinciples: Array.isArray(recordData.brsr_principles)
        ? (recordData.brsr_principles as number[])
        : [],
      confidence: typeof recordData.confidence === "number" ? recordData.confidence : 0,
      missingFields: Array.isArray(recordData.missing_fields)
        ? (recordData.missing_fields as string[])
        : [],
      evidenceKinds: Array.isArray(recordData.evidence_kinds)
        ? (recordData.evidence_kinds as string[])
        : [],
      recommendedActions: Array.isArray(recordData.recommended_actions)
        ? (recordData.recommended_actions as string[])
        : [],
      workflowHistory: workflowHistory.sort(
        (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
      ),
    };
  },

  async approve(
    supabase: SupabaseClient,
    orgId: string,
    recordId: string,
    userId: string,
    comment: string
  ): Promise<ReviewResult> {
    const { data: record, error: readError } = await supabase
      .from("data_records")
      .select("id, status")
      .eq("id", recordId)
      .eq("org_id", orgId)
      .single();

    if (readError || !record) {
      throw new AppError("Record not found", 404, "RECORD_NOT_FOUND", readError);
    }

    const { data, error } = await supabase
      .from("data_records")
      .update({
        status: "final",
        updated_by: userId,
        updated_at: new Date().toISOString(),
        data: {
          ...((record as any).data ?? {}),
          reviewed_by: userId,
          reviewed_at: new Date().toISOString(),
          review_decision: "approved",
          review_comment: comment,
        },
      })
      .eq("id", recordId)
      .eq("org_id", orgId)
      .select("id, status")
      .single();

    if (error || !data) {
      throw new AppError("Failed to approve record", 500, "DB_WRITE_FAILED", error);
    }

    // Log workflow event
    await supabase.from("workflow_events").insert({
      org_id: orgId,
      module_id: (record as any).module_id,
      data_record_id: recordId,
      event_type: "review.approved",
      payload: { comment, previous_status: record.status },
      created_by: userId,
      updated_by: userId,
    });

    return {
      id: data.id,
      status: data.status,
      reviewedBy: userId,
      reviewedAt: new Date().toISOString(),
      comment,
    };
  },

  async reject(
    supabase: SupabaseClient,
    orgId: string,
    recordId: string,
    userId: string,
    comment: string
  ): Promise<ReviewResult> {
    const { data: record, error: readError } = await supabase
      .from("data_records")
      .select("id, status, module_id")
      .eq("id", recordId)
      .eq("org_id", orgId)
      .single();

    if (readError || !record) {
      throw new AppError("Record not found", 404, "RECORD_NOT_FOUND", readError);
    }

    const { data, error } = await supabase
      .from("data_records")
      .update({
        status: "draft",
        updated_by: userId,
        updated_at: new Date().toISOString(),
        data: {
          ...((record as any).data ?? {}),
          reviewed_by: userId,
          reviewed_at: new Date().toISOString(),
          review_decision: "rejected",
          review_comment: comment,
        },
      })
      .eq("id", recordId)
      .eq("org_id", orgId)
      .select("id, status")
      .single();

    if (error || !data) {
      throw new AppError("Failed to reject record", 500, "DB_WRITE_FAILED", error);
    }

    await supabase.from("workflow_events").insert({
      org_id: orgId,
      module_id: (record as any).module_id,
      data_record_id: recordId,
      event_type: "review.rejected",
      payload: { comment, previous_status: record.status },
      created_by: userId,
      updated_by: userId,
    });

    return {
      id: data.id,
      status: data.status,
      reviewedBy: userId,
      reviewedAt: new Date().toISOString(),
      comment,
    };
  },

  async escalate(
    supabase: SupabaseClient,
    orgId: string,
    recordId: string,
    userId: string,
    comment: string
  ): Promise<ReviewResult> {
    const { data: record, error: readError } = await supabase
      .from("data_records")
      .select("id, status, module_id")
      .eq("id", recordId)
      .eq("org_id", orgId)
      .single();

    if (readError || !record) {
      throw new AppError("Record not found", 404, "RECORD_NOT_FOUND", readError);
    }

    // Create an escalated workflow instance
    const { data: workflowInstance } = await supabase
      .from("workflow_instances")
      .insert({
        org_id: orgId,
        module_id: (record as any).module_id,
        data_record_id: recordId,
        state: "escalated",
        current_step: "escalation_review",
        assigned_to: null,
        payload: { reason: comment, escalated_by: userId },
        history: [
          {
            at: new Date().toISOString(),
            by: userId,
            transition: "escalated",
            comment,
          },
        ],
        created_by: userId,
        updated_by: userId,
      })
      .select("id")
      .single();

    await supabase.from("workflow_events").insert({
      org_id: orgId,
      module_id: (record as any).module_id,
      data_record_id: recordId,
      event_type: "review.escalated",
      payload: {
        comment,
        workflow_instance_id: workflowInstance?.id ?? null,
        previous_status: record.status,
      },
      created_by: userId,
      updated_by: userId,
    });

    return {
      id: recordId,
      status: "escalated",
      reviewedBy: userId,
      reviewedAt: new Date().toISOString(),
      comment,
    };
  }
};
