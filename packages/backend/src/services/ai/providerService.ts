import type { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import { env } from "../../config.js";

export interface FileAttachment {
  name: string;
  type: string;
  url: string;
  storage_path?: string;
}

export type ProviderName = "Groq" | "OpenRouter" | "Ollama" | "OpenAI Compatible";

interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface ProviderConfig {
  apiKey?: string;
  baseUrl: string;
  provider: ProviderName;
  model: string;
}

export const FALLBACK = "I'm currently experiencing high demand. Please try again in a moment.";
export const MAX_TOOL_ITERATIONS = 5;
export const DEFAULT_OLLAMA_MODEL = "qwen2.5:3b";
export const DEFAULT_OPENROUTER_MODEL = "openrouter/free";

function getOllamaBaseUrl(): string {
  if (process.env.AI_PROVIDER === "ollama" && process.env.OPENAI_BASE_URL) {
    return process.env.OPENAI_BASE_URL;
  }
  return "http://127.0.0.1:11434/v1";
}

function isOllamaConfigured(): boolean {
  return process.env.AI_PROVIDER === "ollama" || Boolean(process.env.OLLAMA_MODEL);
}

function getProviderConfig(provider: ProviderName, model: string): ProviderConfig | null {
  if (provider === "Groq") {
    const apiKey = process.env.GROQ_API_KEY || "";
    if (!apiKey) return null;
    return { apiKey, baseUrl: "https://api.groq.com/openai/v1", provider, model };
  }

  if (provider === "Ollama") {
    return {
      baseUrl: getOllamaBaseUrl(),
      provider,
      model,
    };
  }

  if (provider === "OpenAI Compatible") {
    const baseUrl = process.env.OPENAI_BASE_URL || "";
    if (!baseUrl) return null;
    return {
      apiKey: process.env.OPENAI_API_KEY || undefined,
      baseUrl,
      provider,
      model,
    };
  }

  const apiKey = process.env.OPENROUTER_API_KEY || "";
  if (!apiKey) return null;
  return { apiKey, baseUrl: "https://openrouter.ai/api/v1", provider, model };
}

export function buildCandidates(requestedModel?: string): ProviderConfig[] {
  const requested = requestedModel?.trim();
  const candidates: Array<ProviderConfig | null> = [];
  const configuredProvider = process.env.AI_PROVIDER;

  if (requested) {
    const looksLikeOpenRouterModel = requested.includes("/");
    const looksLikeOllamaModel = requested.includes(":");

    if (looksLikeOpenRouterModel) {
      candidates.push(getProviderConfig("OpenRouter", requested));
    } else if (looksLikeOllamaModel) {
      candidates.push(getProviderConfig("Ollama", requested));
    } else {
      candidates.push(getProviderConfig("Groq", requested));
      candidates.push(getProviderConfig("OpenAI Compatible", requested));
    }
  }

  if (configuredProvider === "ollama") {
    candidates.push(getProviderConfig("Ollama", process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL));
  }
  if (configuredProvider === "groq") {
    candidates.push(getProviderConfig("Groq", process.env.GROQ_MODEL || "llama-3.3-70b-versatile"));
  }
  if (configuredProvider === "openrouter") {
    candidates.push(getProviderConfig("OpenRouter", process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL));
  }
  if (configuredProvider === "openai_compatible" || configuredProvider === "openai") {
    candidates.push(getProviderConfig("OpenAI Compatible", process.env.OPENAI_MODEL || process.env.AI_MODEL || "gpt-4o-mini"));
  }

  candidates.push(getProviderConfig("Ollama", process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL));
  candidates.push(getProviderConfig("Groq", process.env.GROQ_MODEL || "llama-3.3-70b-versatile"));
  candidates.push(getProviderConfig("OpenRouter", process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL));
  candidates.push(getProviderConfig("OpenAI Compatible", process.env.OPENAI_MODEL || process.env.AI_MODEL || "gpt-4o-mini"));

  const unique = new Map<string, ProviderConfig>();
  for (const candidate of candidates) {
    if (!candidate) continue;
    unique.set(`${candidate.provider}:${candidate.model}`, candidate);
  }
  return [...unique.values()];
}

export function convertMcpToolsToOpenAI(tools: McpToolDefinition[]): Array<Record<string, unknown>> {
  return tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }));
}

export async function extractFileText(file: FileAttachment): Promise<string> {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (["pdf", "doc", "docx"].includes(ext || "")) {
    const { data, error } = await supabase.storage
      .from("evidence")
      .download(file.storage_path || file.name);
    if (error || !data) {
      return `[Cannot read "${file.name}" - file not found in storage]`;
    }

    const text = await data.text();
    const cleanText = text.replace(/[^\x20-\x7E\n\r\t]/g, " ").replace(/\s+/g, " ").trim();
    return cleanText.length > 0
      ? `--- Content from ${file.name} ---\n${cleanText.substring(0, 15000)}\n--- End of ${file.name} ---`
      : `[Cannot read "${file.name}" - the file appears to be a scanned image or uses a format that requires text extraction. Please use the Evidence Upload feature in the Data section to process this file.]`;
  }

  if (["txt", "md", "csv", "json"].includes(ext || "")) {
    const { data, error } = await supabase.storage
      .from("evidence")
      .download(file.storage_path || file.name);
    if (error || !data) {
      return `[Cannot read "${file.name}" - file not found in storage]`;
    }
    const text = await data.text();
    return `--- Content from ${file.name} ---\n${text.substring(0, 15000)}\n--- End of ${file.name} ---`;
  }

  return `[Cannot read "${file.name}" - unsupported file type. Supported: PDF, TXT, MD, CSV, JSON]`;
}

export async function getProvidersHandler(_req: Request, res: Response) {
  const providers: Array<{ id: string; name: string; model: string; available: boolean }> = [];
  if (isOllamaConfigured()) {
    providers.push({
      id: "ollama",
      name: "Ollama",
      model: process.env.OLLAMA_MODEL || DEFAULT_OLLAMA_MODEL,
      available: true,
    });
  }
  if (process.env.OPENAI_BASE_URL && process.env.AI_PROVIDER !== "ollama") {
    providers.push({
      id: "openai_compatible",
      name: "OpenAI Compatible",
      model: process.env.OPENAI_MODEL || process.env.AI_MODEL || "gpt-4o-mini",
      available: true,
    });
  }
  if (process.env.GROQ_API_KEY) {
    providers.push({
      id: "groq",
      name: "Groq",
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      available: true,
    });
  }
  if (process.env.OPENROUTER_API_KEY) {
    providers.push({
      id: "openrouter",
      name: "OpenRouter",
      model: process.env.OPENROUTER_MODEL || DEFAULT_OPENROUTER_MODEL,
      available: true,
    });
  }
  const defaultProvider =
    providers.find((provider) => provider.id === process.env.AI_PROVIDER)?.id || providers[0]?.id || "ollama";
  res.json({ providers, default: defaultProvider });
}