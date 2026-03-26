import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

import { workflowEngine } from "../workflowEngine.js";

type RuleCondition = {
  path?: string;
  operator?: "eq" | "neq" | "gt" | "lt" | "contains" | "in";
  value?: unknown;
};

type RuleAction = {
  state?: string;
  step?: string;
  notify?: string[];
  assign_to_user_id?: string;
};

interface RuleRow {
  id: string;
  condition?: RuleCondition;
  action?: RuleAction;
}

interface SingleResult {
  data: { id: string } | null;
  error: unknown;
}

interface NotificationResult {
  error: unknown;
}

interface MockState {
  workflowInstanceInserts: Array<Record<string, unknown>>;
  notificationInserts: Array<Record<string, unknown>>;
}

interface MockSupabaseInput {
  rules: RuleRow[];
  workflowInstanceResults?: SingleResult[];
  notificationResults?: NotificationResult[];
}

const createMockSupabase = (
  input: MockSupabaseInput
): { client: SupabaseClient; state: MockState } => {
  const state: MockState = {
    workflowInstanceInserts: [],
    notificationInserts: []
  };

  let workflowInsertIdx = 0;
  let notificationInsertIdx = 0;

  const workflowRulesBuilder = {
    select: () => workflowRulesBuilder,
    eq: () => workflowRulesBuilder,
    order: async () => ({ data: input.rules })
  };

  const workflowInstancesBuilder = {
    insert: (payload: Record<string, unknown>) => {
      state.workflowInstanceInserts.push(payload);
      const result =
        input.workflowInstanceResults?.[workflowInsertIdx] ?? {
          data: { id: `wf-${workflowInsertIdx + 1}` },
          error: null
        };
      workflowInsertIdx += 1;

      return {
        select: () => ({
          single: async () => result
        })
      };
    }
  };

  const notificationsBuilder = {
    insert: async (payload: Record<string, unknown>) => {
      state.notificationInserts.push(payload);
      const result = input.notificationResults?.[notificationInsertIdx] ?? { error: null };
      notificationInsertIdx += 1;
      return result;
    }
  };

  const from = (table: string): unknown => {
    if (table === "workflow_rules") {
      return workflowRulesBuilder;
    }
    if (table === "workflow_instances") {
      return workflowInstancesBuilder;
    }
    if (table === "notifications") {
      return notificationsBuilder;
    }
    throw new Error(`Unexpected table in mock: ${table}`);
  };

  return {
    client: { from } as unknown as SupabaseClient,
    state
  };
};

const baseInput = {
  orgId: "org-1",
  moduleId: "module-1",
  dataRecordId: "record-1",
  recordData: { severity: "high", tags: ["ops"] } as Record<string, unknown>,
  actorUserId: "user-1",
  triggerEvent: "record.completed"
};

describe("workflowEngine.runForRecord", () => {
  it("returns [] when no matching rules exist", async () => {
    const { client, state } = createMockSupabase({ rules: [] });

    const result = await workflowEngine.runForRecord(client, baseInput);

    expect(result).toEqual([]);
    expect(state.workflowInstanceInserts).toHaveLength(0);
    expect(state.notificationInserts).toHaveLength(0);
  });

  it("creates a workflow_instance for each matched rule", async () => {
    const { client, state } = createMockSupabase({
      rules: [
        { id: "r1", action: { state: "pending", step: "approval" } },
        { id: "r2", action: { state: "escalated", step: "ops" } }
      ]
    });

    const result = await workflowEngine.runForRecord(client, baseInput);

    expect(result).toEqual(["wf-1", "wf-2"]);
    expect(state.workflowInstanceInserts).toHaveLength(2);
  });

  it("skips rules where matchesCondition returns false", async () => {
    const { client, state } = createMockSupabase({
      rules: [
        { id: "r1", condition: { path: "severity", operator: "eq", value: "high" } },
        { id: "r2", condition: { path: "severity", operator: "eq", value: "low" } }
      ]
    });

    const result = await workflowEngine.runForRecord(client, baseInput);

    expect(result).toEqual(["wf-1"]);
    expect(state.workflowInstanceInserts).toHaveLength(1);
  });

  it("handles Supabase insert error gracefully (no throw, returns partial results)", async () => {
    const { client, state } = createMockSupabase({
      rules: [{ id: "r1" }, { id: "r2" }],
      workflowInstanceResults: [
        { data: { id: "wf-ok" }, error: null },
        { data: null, error: new Error("insert failed") }
      ]
    });

    const result = await workflowEngine.runForRecord(client, baseInput);

    expect(result).toEqual(["wf-ok"]);
    expect(state.workflowInstanceInserts).toHaveLength(2);
  });

  it("inserts notifications when rule.action.notify is non-empty", async () => {
    const { client, state } = createMockSupabase({
      rules: [
        {
          id: "r1",
          action: {
            notify: ["email", "webhook"]
          }
        }
      ]
    });

    await workflowEngine.runForRecord(client, baseInput);

    expect(state.notificationInserts).toHaveLength(2);
    expect(state.notificationInserts[0]?.status).toBe("pending");
  });
});

