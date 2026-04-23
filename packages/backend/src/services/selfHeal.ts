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
AI_PROVIDER=groq
GROQ_API_KEY=your-groq-key
GROQ_MODEL=llama-3.3-70b-versatile

# Optional: OpenRouter fallback
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
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
  if (!env.GROQ_API_KEY && !env.OPENROUTER_API_KEY && !env.OPENAI_API_KEY) {
    logger.warn('No AI provider configured — AI chat will be unavailable');
    logger.info('Set GROQ_API_KEY or OPENROUTER_API_KEY in your .env file');
  }

  // 5. Validate Supabase config
  if (!env.SUPABASE_URL || env.SUPABASE_URL === 'https://placeholder.supabase.co') {
    logger.warn('Supabase URL not configured — database operations will fail');
  }

  // 6. Check disk space (warn if < 1GB free)
  try {
    const stats = fs.statfsSync('/');
    const freeGB = (stats.bfree * stats.bsize) / 1e9;
    if (freeGB < 1) {
      logger.warn({ freeGB }, 'Low disk space — consider cleanup');
    }
  } catch {
    // statfsSync not available on all platforms
  }

  // 7. Log startup diagnostics
  logger.info({
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    aiProvider: env.AI_PROVIDER,
    supabaseConfigured: env.SUPABASE_URL !== 'https://placeholder.supabase.co',
    groqConfigured: !!env.GROQ_API_KEY,
    openrouterConfigured: !!env.OPENROUTER_API_KEY,
  }, 'Self-heal diagnostics');

  if (fixes.length > 0) {
    logger.info({ fixes }, 'Self-heal: applied fixes');
  } else {
    logger.info('Self-heal: all checks passed');
  }
}
