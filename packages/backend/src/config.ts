import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { z } from "zod";

dotenv.config({
  path: fileURLToPath(new URL("../.env", import.meta.url))
});

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8080),

  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_JWT_SECRET: z.string().min(1),

  AI_PROVIDER: z.enum(["openai", "openai_compatible", "anthropic", "openrouter", "grok"]).default("openai"),
  AI_MODEL: z.string().default("gpt-4o-mini"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  OPENAI_BASE_URL: z.string().url().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().optional(),
  OPENROUTER_SITE_URL: z.string().url().optional(),
  OPENROUTER_APP_NAME: z.string().optional(),
  AI_RETRY_ATTEMPTS: z.coerce.number().int().min(1).max(10).default(3),
  AI_RETRY_BASE_MS: z.coerce.number().int().min(50).max(10000).default(400),

  WHATSAPP_BAILEYS_SESSION_PATH: z.string().default(".baileys_auth"),
  EVOLUTION_API_BASE_URL: z.string().url().optional(),
  EVOLUTION_API_KEY: z.string().optional(),
  WHATSAPP_META_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_META_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_META_API_VERSION: z.string().default("v22.0"),
  WHATSAPP_META_VERIFY_TOKEN: z.string().optional(),

  SLACK_BOT_TOKEN: z.string().optional(),
  SLACK_CHANNEL_DEFAULT: z.string().optional(),
  SLACK_WEBHOOK_URL: z.string().url().optional(),

  MSTEAMS_WEBHOOK_URL: z.string().url().optional(),

  EMAIL_SMTP_HOST: z.string().optional(),
  EMAIL_SMTP_PORT: z.coerce.number().int().positive().default(587),
  EMAIL_SMTP_USER: z.string().optional(),
  EMAIL_SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_SMS_FROM: z.string().optional(),
  TWILIO_VOICE_FROM: z.string().optional(),
  TWILIO_VOICE_TWIML_URL: z.string().url().optional(),

  IOT_MQTT_URL: z.string().optional(),
  IOT_MQTT_USERNAME: z.string().optional(),
  IOT_MQTT_PASSWORD: z.string().optional(),
  IOT_MQTT_TOPIC_DEFAULT: z.string().optional(),

  ERP_CRM_WEBHOOK_URL: z.string().url().optional(),
  API_PARTNER_WEBHOOK_URL: z.string().url().optional(),

  ARCHON_BASE_URL: z.string().url().optional(),
  ARCHON_API_TOKEN: z.string().optional(),
  ARCHON_TIMEOUT_MS: z.coerce.number().int().min(1000).max(120000).default(20000),

  CHANNEL_WEBHOOK_TOKEN: z.string().optional(),

  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  RATE_LIMIT_GLOBAL_MAX: z.coerce.number().int().positive().default(240),
  RATE_LIMIT_TENANT_DEFAULT_MAX: z.coerce.number().int().positive().default(120),
  RATE_LIMIT_TENANT_OVERRIDES_JSON: z.string().optional(),

  WEBHOOK_SIGNING_SECRET: z.string().optional()
});
const backendEnvPath = path.join(process.cwd(), "packages", "backend", ".env");
const requiredEnvNames = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_JWT_SECRET"] as const;

function failWithSetupHint(message: string): never {
  throw new Error(
    `${message}\n\n` +
      `To start EnovAIt, fill in the backend settings file at:\n` +
      `${backendEnvPath}\n\n` +
      `You can copy the example file first, then replace the placeholder values in it.\n` +
      `Required values: ${requiredEnvNames.join(", ")}`
  );
}

const parsedEnvResult = EnvSchema.safeParse(process.env);

if (!parsedEnvResult.success) {
  const missingRequired = parsedEnvResult.error.issues
    .filter((issue) => issue.path.length === 1 && requiredEnvNames.includes(issue.path[0] as (typeof requiredEnvNames)[number]))
    .map((issue) => String(issue.path[0]));

  if (missingRequired.length > 0) {
    failWithSetupHint(`Backend settings are incomplete. Missing required values: ${missingRequired.join(", ")}.`);
  }

  throw parsedEnvResult.error;
}

export const env = parsedEnvResult.data;

if (env.AI_PROVIDER === "openai" && !env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required when AI_PROVIDER=openai");
}

if (env.AI_PROVIDER === "openai_compatible" && !env.OPENAI_BASE_URL) {
  throw new Error("OPENAI_BASE_URL is required when AI_PROVIDER=openai_compatible");
}

if (env.AI_PROVIDER === "anthropic" && !env.ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is required when AI_PROVIDER=anthropic");
}

if (env.AI_PROVIDER === "openrouter" && !env.OPENROUTER_API_KEY) {
  throw new Error("OPENROUTER_API_KEY is required when AI_PROVIDER=openrouter");
}

if (!env.EVOLUTION_API_BASE_URL && env.EVOLUTION_API_KEY) {
  throw new Error("EVOLUTION_API_BASE_URL is required when EVOLUTION_API_KEY is set");
}

export const tenantRateLimitOverrides = (() => {
  if (!env.RATE_LIMIT_TENANT_OVERRIDES_JSON) {
    return {} as Record<string, number>;
  }

  try {
    const parsed = JSON.parse(env.RATE_LIMIT_TENANT_OVERRIDES_JSON) as Record<string, unknown>;
    const normalized: Record<string, number> = {};
    for (const [key, value] of Object.entries(parsed)) {
      const n = Number(value);
      if (Number.isFinite(n) && n > 0) {
        normalized[key] = Math.floor(n);
      }
    }
    return normalized;
  } catch {
    return {} as Record<string, number>;
  }
})();

export type RuntimeEnv = typeof env;
