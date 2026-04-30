import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase.js";
import { logger } from "./logger.js";
import { env } from "../config.js";

export type HealthCheckStatus = "healthy" | "degraded" | "unhealthy";

export interface ComponentHealth {
  status: HealthCheckStatus;
  message?: string;
  error?: string;
}

export interface SystemHealth {
  status: HealthCheckStatus;
  timestamp: string;
  uptime: number;
  components: {
    supabase: ComponentHealth;
    ai: ComponentHealth;
  };
}

export async function checkSupabase(): Promise<ComponentHealth> {
  if (!isSupabaseConfigured()) {
    return {
      status: "unhealthy",
      message: "Supabase not configured"
    };
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("users").select("id").limit(1);
    
    if (error) {
      return {
        status: "unhealthy",
        message: "Database connection failed",
        error: error.message
      };
    }

    return { status: "healthy", message: "Connected" };
  } catch (err) {
    return {
      status: "unhealthy",
      message: "Database connection failed",
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

export async function checkAI(): Promise<ComponentHealth> {
  const hasAIKey = Boolean(
    env.GEMINI_API_KEY ||
    env.GROQ_API_KEY ||
    env.OPENROUTER_API_KEY ||
    env.OPENAI_API_KEY ||
    env.ANTHROPIC_API_KEY
  );

  if (!hasAIKey) {
    return {
      status: "unhealthy",
      message: "No AI provider configured"
    };
  }

  return {
    status: "healthy",
    message: `Provider: ${env.AI_PROVIDER}, Model: ${env.AI_MODEL}`
  };
}

export async function getSystemHealth(): Promise<SystemHealth> {
  const [supabase, ai] = await Promise.all([checkSupabase(), checkAI()]);

  const statuses = [supabase.status, ai.status];
  let overallStatus: HealthCheckStatus = "healthy";
  if (statuses.includes("unhealthy")) {
    overallStatus = "unhealthy";
  } else if (statuses.includes("degraded")) {
    overallStatus = "degraded";
  }

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    components: {
      supabase,
      ai
    }
  };
}

export async function runStartupHealthChecks(): Promise<void> {
  logger.info("Running startup health checks...");
  
  const [supabase, ai] = await Promise.all([checkSupabase(), checkAI()]);

  if (supabase.status === "unhealthy") {
    logger.warn("Supabase not configured — starting in degraded mode");
  }

  if (ai.status === "unhealthy") {
    logger.warn("AI provider not configured — AI features unavailable");
  }

  logger.info({ supabase: supabase.status, ai: ai.status }, "Startup health checks complete");
}