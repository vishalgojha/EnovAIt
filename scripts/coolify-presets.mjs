export const REQUIRED_ENV_KEYS = [
  "NODE_ENV",
  "PORT",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_JWT_SECRET",
  "AI_PROVIDER",
  "AI_MODEL",
  "GROQ_API_KEY",
  "GROQ_MODEL",
  "OPENROUTER_API_KEY",
  "OPENROUTER_MODEL",
  "OPENROUTER_SITE_URL",
  "OPENROUTER_APP_NAME",
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
  "OPENAI_BASE_URL",
  "ANTHROPIC_API_KEY",
  "ANTHROPIC_MODEL",
  "AI_RETRY_ATTEMPTS",
  "AI_RETRY_BASE_MS",
  "RATE_LIMIT_WINDOW_MS",
  "RATE_LIMIT_GLOBAL_MAX",
  "RATE_LIMIT_TENANT_DEFAULT_MAX",
  "RATE_LIMIT_TENANT_OVERRIDES",
  "LOG_LEVEL",
  "WHATSAPP_BAILEYS_SESSION_PATH",
];

export const SECRET_ENV_KEYS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_JWT_SECRET",
  "OPENAI_API_KEY",
  "OPENROUTER_API_KEY",
  "ANTHROPIC_API_KEY",
  "GROQ_API_KEY",
  "EVOLUTION_API_KEY",
  "WHATSAPP_META_ACCESS_TOKEN",
  "WHATSAPP_META_VERIFY_TOKEN",
  "SLACK_BOT_TOKEN",
  "SLACK_WEBHOOK_URL",
  "MSTEAMS_WEBHOOK_URL",
  "EMAIL_SMTP_PASS",
  "TWILIO_AUTH_TOKEN",
  "IOT_MQTT_PASSWORD",
  "ARCHON_API_KEY",
  "ARCHON_API_TOKEN",
  "CHANNEL_WEBHOOK_TOKEN",
  "WEBHOOK_SIGNING_SECRET",
];

export function selectKeysFromEnvMap({ envMap, keys, allowPlaceholders, isPlaceholderValue }) {
  const selected = keys
    .map((key) => [key, envMap.get(key)])
    .filter(([, value]) => value !== undefined)
    .filter(([, value]) => (allowPlaceholders ? true : !isPlaceholderValue(value)))
    .map(([key, value]) => ({ key, value }));

  const missing = keys.filter((key) => !envMap.has(key));

  return { selected, missing };
}
