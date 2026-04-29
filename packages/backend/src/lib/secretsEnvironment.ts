import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const backendEnvFilePath = fileURLToPath(new URL("../../.env", import.meta.url));

const optionalSecret = z.preprocess((value) => {
  if (typeof value === "string" && value.trim().length === 0) {
    return undefined;
  }
  return value;
}, z.string().min(1).optional());

const optionalUrl = z.preprocess((value) => {
  if (typeof value === "string" && value.trim().length === 0) {
    return undefined;
  }
  return value;
}, z.string().url().optional());

export const SecretsEnvironmentSchema = z
  .object({
    SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    SUPABASE_JWT_SECRET: z.string().min(1),
    AI_PROVIDER: z.enum(["gemini", "groq", "openrouter", "openai", "openai_compatible", "anthropic"]).optional(),
    ANTHROPIC_API_KEY: optionalSecret,
    OPENROUTER_API_KEY: optionalSecret,
    OPENROUTER_MODEL: optionalSecret,
    OPENAI_BASE_URL: optionalUrl,
    OPENAI_API_KEY: optionalSecret,
    OPENAI_MODEL: optionalSecret,
    GEMINI_API_KEY: optionalSecret,
    GEMINI_MODEL: optionalSecret,
    GROQ_API_KEY: optionalSecret,
    GROQ_MODEL: optionalSecret
  })
  .superRefine((value, ctx) => {
    if (value.AI_PROVIDER === "anthropic" && !value.ANTHROPIC_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ANTHROPIC_API_KEY"],
        message: "ANTHROPIC_API_KEY is required when AI_PROVIDER=anthropic"
      });
    }

    if (value.AI_PROVIDER === "openrouter" && !value.OPENROUTER_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["OPENROUTER_API_KEY"],
        message: "OPENROUTER_API_KEY is required when AI_PROVIDER=openrouter"
      });
    }

    if (value.AI_PROVIDER === "openai_compatible" && !value.OPENAI_BASE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["OPENAI_BASE_URL"],
        message: "OPENAI_BASE_URL is required when AI_PROVIDER=openai_compatible"
      });
    }

    if (value.AI_PROVIDER === "gemini" && !value.GEMINI_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["GEMINI_API_KEY"],
        message: "GEMINI_API_KEY is required when AI_PROVIDER=gemini"
      });
    }

    if (value.AI_PROVIDER === "groq" && !value.GROQ_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["GROQ_API_KEY"],
        message: "GROQ_API_KEY is required when AI_PROVIDER=groq"
      });
    }
  });

export type SecretsEnvironmentInput = z.infer<typeof SecretsEnvironmentSchema>;

export const backendEnvPath = backendEnvFilePath;

const formatEnvValue = (value: string): string => {
  if (/^[A-Za-z0-9_./:@-]+$/.test(value)) {
    return value;
  }

  return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
};

const parseEnvLines = (content: string): Array<{ key: string; value: string; index: number }> => {
  return content
    .split(/\r?\n/)
    .map((line, index) => {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!match) {
        return null;
      }

      const [, key, rawValue] = match;
      return { key, value: rawValue, index };
    })
    .filter((line): line is { key: string; value: string; index: number } => line !== null);
};

const serializeEnvLines = (lines: string[]): string => {
  return `${lines.join("\n")}${lines.length > 0 ? "\n" : ""}`;
};

const normalizeValue = (value: string): string => value.trim();

export interface SecretsEnvironmentStatus {
  path: string;
  required: Record<"SUPABASE_URL" | "SUPABASE_ANON_KEY" | "SUPABASE_SERVICE_ROLE_KEY" | "SUPABASE_JWT_SECRET", boolean>;
  aiProvider: string | null;
  aiKeys: {
    anthropic: boolean;
    openrouter: boolean;
    openaiCompatible: boolean;
    gemini: boolean;
    groq: boolean;
  };
}

export const readSecretsEnvironmentStatus = async (): Promise<SecretsEnvironmentStatus> => {
  let content = "";

  try {
    content = await readFile(backendEnvPath, "utf8");
  } catch {
    content = "";
  }

  const entries = parseEnvLines(content);
  const lookup = new Map(entries.map((entry) => [entry.key, normalizeValue(entry.value)]));

  return {
    path: backendEnvPath,
    required: {
      SUPABASE_URL: lookup.has("SUPABASE_URL") && lookup.get("SUPABASE_URL") !== "",
      SUPABASE_ANON_KEY: lookup.has("SUPABASE_ANON_KEY") && lookup.get("SUPABASE_ANON_KEY") !== "",
      SUPABASE_SERVICE_ROLE_KEY: lookup.has("SUPABASE_SERVICE_ROLE_KEY") && lookup.get("SUPABASE_SERVICE_ROLE_KEY") !== "",
      SUPABASE_JWT_SECRET: lookup.has("SUPABASE_JWT_SECRET") && lookup.get("SUPABASE_JWT_SECRET") !== ""
    },
    aiProvider: lookup.get("AI_PROVIDER") ?? null,
     aiKeys: {
       anthropic: lookup.has("ANTHROPIC_API_KEY") && lookup.get("ANTHROPIC_API_KEY") !== "",
       openrouter: lookup.has("OPENROUTER_API_KEY") && lookup.get("OPENROUTER_API_KEY") !== "",
       openaiCompatible: lookup.has("OPENAI_BASE_URL") && lookup.get("OPENAI_BASE_URL") !== "",
       gemini: lookup.has("GEMINI_API_KEY") && lookup.get("GEMINI_API_KEY") !== "",
       groq: lookup.has("GROQ_API_KEY") && lookup.get("GROQ_API_KEY") !== ""
     }
  };
};

export const writeSecretsEnvironment = async (updates: SecretsEnvironmentInput): Promise<SecretsEnvironmentStatus> => {
  let content = "";

  try {
    content = await readFile(backendEnvPath, "utf8");
  } catch {
    content = "";
  }

  const lines = content.split(/\r?\n/);
  const lineEntries = parseEnvLines(content);
  const lineIndexByKey = new Map(lineEntries.map((entry) => [entry.key, entry.index]));

  const normalizedUpdates: Record<string, string> = {
    SUPABASE_URL: updates.SUPABASE_URL,
    SUPABASE_ANON_KEY: updates.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: updates.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_JWT_SECRET: updates.SUPABASE_JWT_SECRET
  };

  if (updates.AI_PROVIDER) {
    normalizedUpdates.AI_PROVIDER = updates.AI_PROVIDER;
  }
  if (updates.ANTHROPIC_API_KEY) {
    normalizedUpdates.ANTHROPIC_API_KEY = updates.ANTHROPIC_API_KEY;
  }
  if (updates.OPENROUTER_API_KEY) {
    normalizedUpdates.OPENROUTER_API_KEY = updates.OPENROUTER_API_KEY;
  }
  if (updates.OPENROUTER_MODEL) {
    normalizedUpdates.OPENROUTER_MODEL = updates.OPENROUTER_MODEL;
  }
  if (updates.OPENAI_BASE_URL) {
    normalizedUpdates.OPENAI_BASE_URL = updates.OPENAI_BASE_URL;
  }
  if (updates.OPENAI_API_KEY) {
    normalizedUpdates.OPENAI_API_KEY = updates.OPENAI_API_KEY;
  }
  if (updates.OPENAI_MODEL) {
    normalizedUpdates.OPENAI_MODEL = updates.OPENAI_MODEL;
  }
  if (updates.OLLAMA_MODEL) {
    normalizedUpdates.OLLAMA_MODEL = updates.OLLAMA_MODEL;
  }
  if (updates.GROQ_API_KEY) {
    normalizedUpdates.GROQ_API_KEY = updates.GROQ_API_KEY;
  }
  if (updates.GROQ_MODEL) {
    normalizedUpdates.GROQ_MODEL = updates.GROQ_MODEL;
  }

  const serializedUpdates = Object.entries(normalizedUpdates).map(([key, value]) => `${key}=${formatEnvValue(value)}`);

  for (const [key, line] of lineIndexByKey.entries()) {
    const update = serializedUpdates.find((entry) => entry.startsWith(`${key}=`));
    if (update) {
      lines[line] = update;
    }
  }

  for (const update of serializedUpdates) {
    const key = update.split("=", 1)[0];
    if (!lineIndexByKey.has(key)) {
      lines.push(update);
    }
  }

  const compacted = lines.filter((line, index, array) => {
    if (line.trim() !== "") {
      return true;
    }

    return index === 0 || array[index - 1]?.trim() !== "";
  });

  await writeFile(backendEnvPath, serializeEnvLines(compacted), "utf8");

  return readSecretsEnvironmentStatus();
};
