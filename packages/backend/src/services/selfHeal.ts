import fs from 'fs';
import path from 'path';
import { logger } from '../lib/logger.js';
import { env } from '../config.js';

export async function selfHeal(): Promise<void> {
  const fixes: string[] = [];

  // 1. Ensure log directory exists and is writable
  const logDir = path.resolve('/opt/enovait/logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
    fixes.push('Created log directory');
  }

  // 2. Ensure app directory exists
  const appDir = path.resolve('/opt/enovait/app');
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true });
    fixes.push('Created app directory');
  }

    // 3. Ensure .env file exists (create template if missing)
    const envPath = path.resolve('/opt/enovait/api/.env');
    if (!fs.existsSync(envPath)) {
      const template = `# EnovAIt Backend Configuration
NODE_ENV=production
PORT=3000

# Supabase (Required)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# AI Provider (At least one required)
# Priority: Gemini → Groq → OpenRouter
AI_PROVIDER=gemini
GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-2.5-flash

# Secondary: Groq
GROQ_API_KEY=your-groq-key
GROQ_MODEL=llama-3.3-70b-versatile

# Fallback: OpenRouter
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_MODEL=openrouter/free

# WhatsApp Baileys
WHATSAPP_BAILEYS_SESSION_PATH=/data/baileys
WHATSAPP_BAILEYS_DEFAULT_LABEL=primary
`;
    try {
      fs.mkdirSync(path.dirname(envPath), { recursive: true });
      fs.writeFileSync(envPath, template, 'utf-8');
      fixes.push('Created .env template (configure manually)');
    } catch (error) {
      logger.warn({ envPath, error }, 'Skipped .env template creation');
    }
  }

  // 4. Ensure AI provider is configured
  if (!env.GEMINI_API_KEY && !env.GROQ_API_KEY && !env.OPENROUTER_API_KEY && !env.OPENAI_API_KEY) {
    logger.warn('No AI provider configured — AI chat will be unavailable');
    logger.info('Set GEMINI_API_KEY, GROQ_API_KEY, or OPENROUTER_API_KEY in your .env file');
  }

  // 5. Log startup diagnostics
  logger.info({
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    aiProvider: env.AI_PROVIDER,
    supabaseConfigured: env.SUPABASE_URL !== 'https://placeholder.supabase.co',
    geminiConfigured: !!env.GEMINI_API_KEY,
    groqConfigured: !!env.GROQ_API_KEY,
    openrouterConfigured: !!env.OPENROUTER_API_KEY,
  }, 'Self-heal diagnostics');

  if (fixes.length > 0) {
    logger.info({ fixes }, 'Self-heal: applied fixes');
  } else {
    logger.info('Self-heal: all checks passed');
  }
}
