import type { SupabaseClient } from "@supabase/supabase-js";

import { logger } from "../../lib/logger.js";

interface WorkflowRuleCondition {
  path?: string;
  operator?: "eq" | "neq" | "gt" | "lt" | "contains" | "in";
  value?: unknown;
}

interface WorkflowRuleAction {
  state?: string;
  step?: string;
  notify?: string[];
  assign_to_user_id?: string;
}

interface WorkflowRuleRow {
  id: string;
  condition: WorkflowRuleCondition;
  action: WorkflowRuleAction;
}

interface RunWorkflowInput {
  orgId: string;
  moduleId: string;
  dataRecordId: string;
  recordData: Record<string, unknown>;
  actorUserId: string;
  triggerEvent: string;
}

const getAtPath = (data: Record<string, unknown>, path: string): unknown => {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, data);
};

const matchesCondition = (condition: WorkflowRuleCondition, data: Record<string, unknown>): boolean => {
  if (!condition.path || !condition.operator) {
    return true;
  }

  const left = getAtPath(data, condition.path);
  const right = condition.value;

  switch (condition.operator) {
    case "eq":
      return left === right;
    case "neq":
      return left !== right;
    case "gt":
      return Number(left) > Number(right);
    case "lt":
      return Number(left) < Number(right);
    case "contains":
      return Array.isArray(left) ? left.includes(right) : String(left ?? "").includes(String(right ?? ""));
    case "in":
      return Array.isArray(right) ? right.includes(left) : false;
    default:
      return false;
  }
};

export const workflowEngine = {
  async runForRecord(supabase: SupabaseClient, input: RunWorkflowInput): Promise<string[]> {
    const { data: rules } = await supabase
      .from("workflow_rules")
      .select("id, condition, action")
      .eq("org_id", input.orgId)
      .eq("module_id", input.moduleId)
      .eq("trigger_event", input.triggerEvent)
      .eq("is_active", true)
      .order("priority", { ascending: true });

    if (!rules?.length) {
      return [];
    }

    const matchedRules = (rules as WorkflowRuleRow[]).filter((rule) =>
      matchesCondition(rule.condition ?? {}, input.recordData)
    );

    const createdIds: string[] = [];

    for (const rule of matchedRules) {
      const state = rule.action?.state ?? "pending";
      const step = rule.action?.step ?? "created";
      const assignedTo = rule.action?.assign_to_user_id ?? null;

      const { data: instance, error } = await supabase
        .from("workflow_instances")
        .insert({
          org_id: input.orgId,
          module_id: input.moduleId,
          data_record_id: input.dataRecordId,
          rule_id: rule.id,
          state,
          current_step: step,
          assigned_to: assignedTo,
          payload: {
            source: "chat_extraction",
            action: rule.action,
            rule_condition: rule.condition
          },
          history: [
            {
              at: new Date().toISOString(),
              by: input.actorUserId,
              transition: "created",
              state,
              step
            }
          ],
          created_by: input.actorUserId,
          updated_by: input.actorUserId
        })
        .select("id")
        .single();

      if (error || !instance) {
        continue;
      }

      createdIds.push(instance.id);

      const notifyChannels = Array.isArray(rule.action?.notify) ? rule.action.notify : [];
      if (notifyChannels.length > 0) {
        try {
          for (const channel of notifyChannels) {
            const { error: notificationError } = await supabase.from("notifications").insert({
              org_id: input.orgId,
              user_id: assignedTo,
              workflow_instance_id: instance.id,
              channel,
              status: "pending",
              title: "Workflow task created",
              body: `Workflow ${instance.id} is ${state} at step ${step}`,
              metadata: {
                data_record_id: input.dataRecordId,
                module_id: input.moduleId
              },
              created_by: input.actorUserId,
              updated_by: input.actorUserId
            });

            if (notificationError) {
              logger.error(
                { err: notificationError, workflow_instance_id: instance.id, channel, org_id: input.orgId },
                "Failed to queue workflow notification"
              );
            }
          }
        } catch (error) {
          logger.error(
            { err: error, workflow_instance_id: instance.id, org_id: input.orgId },
            "Unexpected error while queueing workflow notifications"
          );
        }
      }
    }

    return createdIds;
  }
};
