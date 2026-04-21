import type { RequestHandler } from "express";
import rateLimit from "express-rate-limit";

import { env, tenantRateLimitOverrides } from "../../config.js";

const ipOrUnknown = (req: Parameters<Exclude<RequestHandler, undefined>>[0]): string => req.ip || "unknown";

export const globalApiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_GLOBAL_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `global:${ipOrUnknown(req)}`
});

export const webhookLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: Math.max(30, Math.floor(env.RATE_LIMIT_GLOBAL_MAX / 2)),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `webhook:${ipOrUnknown(req)}`
});

export const tenantAwareLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: (req) => {
    const orgId = req.auth?.orgId;
    const overrides = tenantRateLimitOverrides();
    if (orgId && orgId in overrides) {
      return overrides[orgId];
    }
    return env.RATE_LIMIT_TENANT_DEFAULT_MAX;
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const orgId = req.auth?.orgId ?? "public";
    const userId = req.auth?.userId ?? "anon";
    return `tenant:${orgId}:user:${userId}:ip:${ipOrUnknown(req)}`;
  }
});
