import { env } from "../../config.js";
import { AppError } from "../../lib/errors.js";

interface ArchonHealthResponse {
  status?: string;
  version?: string;
  git_sha?: string | null;
}

interface ArchonTaskPayload {
  goal: string;
  language?: string;
  context?: Record<string, unknown>;
}

interface ArchonTaskResponse {
  task_id: string;
  goal: string;
  mode: "debate";
  final_answer: string;
  confidence: number;
  budget: Record<string, unknown>;
  debate?: Record<string, unknown> | null;
}

export interface ArchonStatus {
  configured: boolean;
  reachable: boolean;
  baseUrl?: string;
  version?: string;
  gitSha?: string | null;
  detail: string;
}

const joinUrl = (baseUrl: string, path: string) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

const buildHeaders = (includeAuth: boolean): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (includeAuth && env.ARCHON_API_TOKEN) {
    headers.Authorization = `Bearer ${env.ARCHON_API_TOKEN}`;
  }

  return headers;
};

const fetchWithTimeout = async (url: string, init: RequestInit = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.ARCHON_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new AppError("Archon request timed out", 504, "ARCHON_TIMEOUT");
    }

    throw new AppError("Archon is unreachable", 502, "ARCHON_UNREACHABLE", error);
  } finally {
    clearTimeout(timeout);
  }
};

export const archonService = {
  async getStatus(): Promise<ArchonStatus> {
    if (!env.ARCHON_BASE_URL) {
      return {
        configured: false,
        reachable: false,
        detail: "Set ARCHON_BASE_URL to enable Archon orchestration inside EnovAIt.",
      };
    }

    const response = await fetchWithTimeout(joinUrl(env.ARCHON_BASE_URL, "/health"), {
      method: "GET",
      headers: buildHeaders(false),
    });

    if (!response.ok) {
      throw new AppError(
        `Archon health check failed with status ${response.status}`,
        502,
        "ARCHON_HEALTH_FAILED"
      );
    }

    const payload = (await response.json()) as ArchonHealthResponse;

    return {
      configured: true,
      reachable: payload.status === "ok",
      baseUrl: env.ARCHON_BASE_URL,
      version: payload.version,
      gitSha: payload.git_sha ?? null,
      detail:
        payload.status === "ok"
          ? "Archon is reachable and ready to execute orchestration tasks."
          : "Archon responded, but did not report a healthy runtime.",
    };
  },

  async runTask(payload: ArchonTaskPayload): Promise<ArchonTaskResponse> {
    if (!env.ARCHON_BASE_URL) {
      throw new AppError(
        "Archon is not configured. Set ARCHON_BASE_URL before running tasks.",
        400,
        "ARCHON_NOT_CONFIGURED"
      );
    }

    const response = await fetchWithTimeout(joinUrl(env.ARCHON_BASE_URL, "/v1/tasks"), {
      method: "POST",
      headers: buildHeaders(true),
      body: JSON.stringify({
        goal: payload.goal,
        mode: "debate",
        language: payload.language,
        context: payload.context ?? {},
      }),
    });

    if (response.status === 401 || response.status === 403) {
      throw new AppError(
        "Archon rejected the request. Set ARCHON_API_TOKEN to a valid Archon bearer token.",
        502,
        "ARCHON_AUTH_FAILED"
      );
    }

    if (!response.ok) {
      const detail = await response.text();
      throw new AppError(
        `Archon task failed with status ${response.status}`,
        502,
        "ARCHON_TASK_FAILED",
        detail
      );
    }

    return (await response.json()) as ArchonTaskResponse;
  },
};
