import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),

  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(1),

  AI_PROVIDER: z.enum(["openai", "anthropic", "openrouter", "grok"]).default("openai"),
  AI_MODEL: z.string().default("gpt-4o-mini"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().optional(),
  OPENROUTER_SITE_URL: z.string().url().optional(),
  OPENROUTER_APP_NAME: z.string().optional(),

  WHATSAPP_BAILEYS_SESSION_PATH: z.string().default(".baileys_auth"),
  WHATSAPP_META_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_META_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_META_API_VERSION: z.string().default("v22.0"),
  WHATSAPP_META_VERIFY_TOKEN: z.string().optional(),

  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  WEBHOOK_SIGNING_SECRET: z.string().optional()
});

export const env = EnvSchema.parse(process.env);

if (env.AI_PROVIDER === "openai" && !env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required when AI_PROVIDER=openai");
}

if (env.AI_PROVIDER === "anthropic" && !env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is required when AI_PROVIDER=anthropic");
}

if (env.AI_PROVIDER === "openrouter" && !env.OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY is required when AI_PROVIDER=openrouter");
}

export type RuntimeEnv = typeof env;
