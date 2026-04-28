import { createClient } from "@supabase/supabase-js";
import { env } from "../../config.js";

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

export interface DashboardStats {
  readiness: { value: number; change: number };
  carbonFootprint: { value: number; change: number };
  pendingReviews: { count: number; priority: number };
  integrations: { count: number; status: "healthy" | "degraded" | "unhealthy" };
}

export interface FilingRecord {
  id: string;
  title: string;
  user: string;
  status: "Pending" | "In Review" | "Completed" | "Flagged";
  due: string;
}

export interface ModuleData {
  label: string;
  initials: string;
  progress: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data: org } = await supabase
    .from("organizations")
    .select("readiness_score, carbon_footprint")
    .limit(1)
    .single();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("status, priority")
    .eq("status", "pending");

  const { data: integrations } = await supabase
    .from("channels")
    .select("id, status");

  const priorityCount = reviews?.filter((r) => r.priority === "high").length ?? 0;
  const healthyCount = integrations?.filter((i) => i.status === "connected").length ?? 0;

  return {
    readiness: {
      value: org?.readiness_score ?? 0,
      change: 0,
    },
    carbonFootprint: {
      value: org?.carbon_footprint ?? 0,
      change: 0,
    },
    pendingReviews: {
      count: reviews?.length ?? 0,
      priority: priorityCount,
    },
    integrations: {
      count: healthyCount,
      status: healthyCount > 0 ? "healthy" : "unhealthy",
    },
  };
}

export async function getRecentFilings(limit = 10): Promise<FilingRecord[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("id, title, assigned_to, status, due_date")
    .order("due_date", { ascending: true })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    title: row.title,
    user: row.assigned_to ?? "Unassigned",
    status: row.status as FilingRecord["status"],
    due: new Date(row.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));
}

export async function getActiveModules(): Promise<ModuleData[]> {
  return [
    { label: "Emissions", initials: "E", progress: 0 },
    { label: "Governance", initials: "G", progress: 0 },
    { label: "Social", initials: "S", progress: 0 },
    { label: "Review", initials: "R", progress: 0 },
  ];
}