import "dotenv/config";
import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("production"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  TRUST_PROXY: z.string().default("0"),

  // Supabase
  SUPABASE_URL: z.string().url().default("https://placeholder.supabase.co"),
  SUPABASE_ANON_KEY: z.string().default(""),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default(""),
  SUPABASE_JWT_SECRET: z.string().default(""),

  // AI Provider
  AI_PROVIDER: z.enum(["openai", "openai_compatible", "ollama", "anthropic", "openrouter", "groq", "grok"]).default("groq"),
  AI_MODEL: z.string().default("llama-3.3-70b-versatile"),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  OPENAI_BASE_URL: z.string().url().optional(),
  OLLAMA_MODEL: z.string().optional().default("qwen2.5:3b"),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().optional().default("openrouter/free"),
  OPENROUTER_SITE_URL: z.string().url().optional().default("https://enov360.com"),
  OPENROUTER_APP_NAME: z.string().optional().default("EnovAIt"),
  GROQ_API_KEY: z.string().optional(),
  GROQ_MODEL: z.string().optional().default("llama-3.3-70b-versatile"),
  AI_RETRY_ATTEMPTS: z.coerce.number().int().min(1).max(10).default(3),
  AI_RETRY_BASE_MS: z.coerce.number().int().min(50).max(10000).default(400),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_GLOBAL_MAX: z.coerce.number().int().positive().default(240),
  RATE_LIMIT_TENANT_DEFAULT_MAX: z.coerce.number().int().positive().default(120),

  // Webhook / Security
  WEBHOOK_SIGNING_SECRET: z.string().optional(),
  CHANNEL_WEBHOOK_TOKEN: z.string().optional(),
ENABLE_SUPER_ADMIN: z.coerce.boolean().default(false),

  // Legacy (unused, kept for type compatibility)
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
  WHATSAPP_META_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_META_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_META_API_VERSION: z.string().default("v22.0"),
  WHATSAPP_META_VERIFY_TOKEN: z.string().optional(),

  // WhatsApp (Baileys)
  WHATSAPP_BAILEYS_SESSION_PATH: z.string().default(".baileys_auth"),
  WHATSAPP_BAILEYS_DEFAULT_LABEL: z.string().default("primary"),
  WHATSAPP_BAILEYS_OWNER_NAME: z.string().optional(),
  EVOLUTION_API_BASE_URL: z.string().url().optional(),
  EVOLUTION_API_KEY: z.string().optional(),

  // IoT / ERP
  IOT_MQTT_URL: z.string().url().optional(),
  IOT_MQTT_USERNAME: z.string().optional(),
  IOT_MQTT_PASSWORD: z.string().optional(),
  IOT_MQTT_TOPIC_DEFAULT: z.string().default("enovait/sensors"),
  ERP_CRM_WEBHOOK_URL: z.string().url().optional(),
  API_PARTNER_WEBHOOK_URL: z.string().url().optional(),

// Logging
  LOG_LEVEL: z.string().default("info"),
  ALLOWED_ORIGINS: z.string().optional(),
});

// Self-heal: auto-detect Groq if key is present
const raw = { ...process.env };
if (raw.GROQ_API_KEY && !raw.AI_PROVIDER) {
  raw.AI_PROVIDER = "groq";
}

export const env = envSchema.parse(raw);

function parseTrustProxy(value: string): boolean | number | string {
  const normalized = value.trim().toLowerCase();

  if (normalized === "true") return true;
  if (normalized === "false") return false;

  const numericValue = Number.parseInt(value, 10);
  if (!Number.isNaN(numericValue) && String(numericValue) === value.trim()) {
    return numericValue;
  }

  return value;
}

export const trustProxy = parseTrustProxy(env.TRUST_PROXY);

export function tenantRateLimitOverrides(): Record<string, number> {
  try {
    const raw = process.env.RATE_LIMIT_TENANT_OVERRIDES;
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return {};
  }
}
